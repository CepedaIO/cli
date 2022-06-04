import {
  NormalizedComposeProvider,
  ProviderContext,
  StartOptions
} from "../../../../types";
import {normalize} from "path";
import {chmod, readFile, writeFile} from "fs/promises";
import {BaseService, NodeJSService} from "../../docker-services";
import {distDir} from "../../../../config/app";
import {existsSync} from "fs";
import {iProject} from "../../models/Project";

async function getLinkInfo(project:iProject, instance:BaseService) {
  let manager;

  if(existsSync(`${project.services.root}/${instance.name}/package-lock.json`)) {
    manager = 'npm';
  } else if(existsSync(`${project.services.root}/${instance.name}/yarn.lock`)) {
    manager = 'yarn';
  } else {
    throw new Error(`Unable to determine package manager for (${instance.name}), did you 'yarn install'?`);
  }

  const nameMap = await instance.npmLinks().reduce(async (res, serviceName) => {
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

async function entrypointActionsFromLinks(project:iProject, instance: BaseService): Promise<string[]> {
  const npmLinks = instance.npmLinks();
  const info = await getLinkInfo(project, instance);
  let actions:string[] = [];

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

  return actions;
}

async function generateEntrypointLines(project:iProject, instance: BaseService, context:ProviderContext) {
  let actions: string[] = await entrypointActionsFromLinks(project, instance);
  const command = instance.command(context);

  if(Array.isArray(command)) {
    actions = actions.concat(command as string[]);
  }

  if(actions.length > 0) {
    if(typeof command === "string") {
      actions.push(command);
    }

    if(instance.provider.entrypoint) {
      actions.push(`sh ${instance.provider.entrypoint}`);
    }

    actions.unshift('#!/usr/bin/env sh');
  }

  return actions;
}

export async function generateEntrypoint(project:iProject, provider: NormalizedComposeProvider, options: StartOptions) {
  for(const [serviceName, serviceDef] of Object.entries(provider.services)) {
    if(serviceDef instanceof BaseService) {
      const context:ProviderContext = {
        name: serviceName,
        options
      };

      if(serviceDef.needsEntrypoint(context)) {
        const lines = await generateEntrypointLines(project, serviceDef, context);
        const entrypointName = `${context.name}-entrypoint.sh`;
        const entrypointPath = normalize(`${distDir(project.root)}/${entrypointName}`);
        console.log('Writing entrypoint:', lines);
        await writeFile(entrypointPath, lines.join('\n'));
        await chmod(entrypointPath, "755");
      }
    }
  }
}
