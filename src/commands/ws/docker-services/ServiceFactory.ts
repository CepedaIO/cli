import {
  Dict,
  DockerService,
  FieldProvider,
  ProviderContext, RepoInfo,
  iServiceFactory,
  ServiceProvider, iEntrypointFactory,
} from "../../../types";
import {isFunction} from "@cepedaio/utils";
import {composer} from "../services/composer";
import {basename, isAbsolute} from "path";
import {iProject} from "../models/Project";
import {existsSync} from "fs";
import {readFile} from "fs/promises";

export function resolveField<T>(fieldProvider:FieldProvider<T>, context:ProviderContext): T  | undefined {
  if(isFunction(fieldProvider)) {
    return fieldProvider(context);
  }

  return fieldProvider;
}

function getVolumes(serviceInst: ServiceFactory, context: ProviderContext) {
  const volumes = resolveField(serviceInst.provider.volumes, context) || [];

  if(serviceInst.source) {
    volumes.push(`./services/${serviceInst.name}:/mnt/host`)
  }

  const linkVolumes = serviceInst.npmLinks().map((serviceName) => {
    if(isAbsolute(serviceName)) {
      const folderName = basename(serviceName);
      return `${serviceName}:/mnt/${folderName}`;
    }

    return `./services/${serviceName}:/mnt/${serviceName}`;
  });

  volumes.push.apply(volumes, linkVolumes);

  if(serviceInst.needsEntrypoint(context)) {
    const entrypointName = `${context.name}-entrypoint.sh`;
    const entrypointPath = `./.dist/${entrypointName}`;
    volumes.push(`${entrypointPath}:/mnt/entrypoint.sh`)
  }

  return volumes;
}

export class ServiceFactory implements iServiceFactory, iEntrypointFactory {
  public name!: string;

  constructor(
    public provider: ServiceProvider
  ) {}

  linkWithNPM(serviceName: string) {
    if(!this.provider.npmLinks) {
      this.provider.npmLinks = [];
    }

    this.provider.npmLinks.push(serviceName);
  }

  get source(): RepoInfo | undefined {
    return this.provider.repo;
  }

  command(context:ProviderContext): DockerService['command'] {
    return resolveField(this.provider.command, context);
  }

  service(context: ProviderContext): DockerService {
    const command = this.command(context);
    const service = {
      ...this.provider,
      volumes: getVolumes(this, context),
      command: !Array.isArray(command) ? command : undefined,
      image: resolveField(this.provider.image, context),
      build: resolveField(this.provider.build, context),
      working_dir: '/mnt/host'
    } as DockerService;

    if(this.needsEntrypoint(context)) {
      service.entrypoint = "/mnt/entrypoint.sh";
    }

    return service;
  }

  env(context: ProviderContext): Dict<string | number> {
    return this.provider.env ? {
      ...this.provider.env
    } : {};
  }

  npmLinks() {
    return this.provider.npmLinks || [];
  }

  hasNPMLinks(): boolean {
    return this.npmLinks().length > 0;
  }

  needsEntrypoint(context:ProviderContext): boolean {
    return this.hasNPMLinks() || Array.isArray(this.command(context));
  }

  addSource(url, init?) {
    this.provider.repo = { url, init };
  }

  async getLinkInfo(project: iProject) {
    let manager;

    if(existsSync(`${project.services.root}/${this.name}/package-lock.json`)) {
      manager = 'npm';
    } else if(existsSync(`${project.services.root}/${this.name}/yarn.lock`)) {
      manager = 'yarn';
    } else {
      throw new Error(`Unable to determine package manager for (${this.name}), did you 'yarn install'?`);
    }

    const nameMap = await this.npmLinks().reduce(async (res, serviceName) => {
      const path = `${project.services.root}/${serviceName}/package.json`;
      if(!existsSync(path)) {
        throw new Error(`Is not an NPM repo: ${serviceName}`)
      }

      const packageData = await readFile(path, 'utf-8');
      const packageJSON = JSON.parse(packageData);

      res[serviceName] = packageJSON.name;

      return res;
    }, {});

    return {
      manager, nameMap
    };
  }

  async entrypointLines(project:iProject, context:ProviderContext): Promise<string[]> {
    let actions: string[] = [];
    const command = this.command(context);
    const npmLinks = this.npmLinks();
    const info = await this.getLinkInfo(project);

    if(npmLinks.length > 0) {
      actions.push('cwd=$PWD')

      actions = actions.concat(npmLinks.map((serviceName) => {
        return `cd /mnt/${serviceName} && ${info.manager} link`;
      }));

      actions.push(`cd $cwd`);

      actions = actions.concat(npmLinks.map((serviceName) => {
        return `${info.manager} link ${info.nameMap[serviceName]}`;
      }));
    }

    if(Array.isArray(command)) {
      actions = actions.concat(command as string[]);
    }

    if(actions.length > 0) {
      if(typeof command === "string") {
        actions.push(command);
      }

      if(this.provider.entrypoint) {
        actions.push(`sh ${this.provider.entrypoint}`);
      }

      actions.unshift('#!/usr/bin/env sh');
    }

    return actions;
  }
}
