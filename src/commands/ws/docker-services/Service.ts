import {
  Dict,
  DockerService,
  FieldProvider,
  ProviderContext, RepoInfo,
  ServiceInstance,
  ServiceProvider,
} from "../../../types";
import {isFunction} from "@vlegm/utils";
import {composer} from "../services/composer";
import {basename, isAbsolute} from "path";

export function resolveField<T>(fieldProvider:FieldProvider<T>, context:ProviderContext): T  | undefined {
  if(isFunction(fieldProvider)) {
    return fieldProvider(context);
  }

  return fieldProvider;
}

function getVolumes(serviceInst: BaseService, context: ProviderContext) {
  const volumes = resolveField(serviceInst.provider.volumes, context) || [];

  if(composer.getSources().has(serviceInst.name)) {
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

export abstract class BaseService implements ServiceInstance {
  sources: Set<RepoInfo> = new Set();
  name!: string;

  constructor(
    public provider: ServiceProvider
  ) {
    if(provider.repo) {
      this.sources.add(provider.repo);
    }
  }

  linkWithNPM(serviceName: string) {
    if(!this.provider.npmLinks) {
      this.provider.npmLinks = [];
    }

    this.provider.npmLinks.push(serviceName);
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
}

export class Service extends BaseService {
  addSource(source:RepoInfo) {
    this.sources.add(source);
  }
}