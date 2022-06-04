import {
  Dict,
  DockerService,
  FieldProvider,
  ProviderContext, RepoInfo,
  ServiceInstance,
  ServiceProvider
} from "../../../types";
import {tuple} from "../commands/start/tuple";
import {isFunction} from "@vlegm/utils";
import {sources} from "../services/sources";

export function isNPMLink(link: string): boolean {
  const [,linkName] = tuple(link);
  return !!linkName;
}

export function resolveProvider<T>(fieldProvider: FieldProvider<T> | undefined, context:ProviderContext): T  | undefined {
  if(isFunction(fieldProvider)) {
    return fieldProvider(context);
  }

  return fieldProvider;
}

function getVolumes(serviceProvider: ServiceProvider, context: ProviderContext) {
  const volumes = resolveProvider(serviceProvider.volumes as string[], context) || [];

  if(sources.has(context.name)) {
    volumes.push(`./services/${context.name}:/mnt/host`)
  }

  if(serviceProvider.mnts) {
    const linkVolumes = serviceProvider.mnts.map((link) => {
      const [serviceName] = tuple(link);
      return `./services/${serviceName}:/mnt/${serviceName}`;
    });

    volumes.push.apply(volumes, linkVolumes);
  }

  if(serviceProvider.mnts || Array.isArray(context.command)) {
    const entrypointName = `${context.name}-entrypoint.sh`;
    const entrypointPath = `./.dist/${entrypointName}`;
    volumes.push(`${entrypointPath}:/mnt/entrypoint.sh`)
  }

  return volumes;
}

export abstract class BaseService implements ServiceInstance {
  sources: Set<RepoInfo> = new Set();

  constructor(
    public provider: ServiceProvider
  ) {
    if(provider.repo) {
      this.sources.add(provider.repo);
    }
  }

  command(context:ProviderContext): string | string[] | undefined {
    return resolveProvider(this.provider.command, context) as string | string[] | undefined;
  }

  service(context: ProviderContext): DockerService {
    const command = this.command(context);
    const service = {
      ...this.provider,
      volumes: getVolumes(this.provider, context),
      command: !Array.isArray(command) ? command : undefined,
      image: resolveProvider(this.provider.image, context),
      build: resolveProvider(this.provider.build, context),
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
    return !this.provider.mnts ? [] : this.provider.mnts.filter(isNPMLink);
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