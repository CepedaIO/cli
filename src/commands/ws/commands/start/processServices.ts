import {iProject} from "../../models/Project";
import {
  StartOptions,
  ComposeProvider, Dict,
  DockerService, isServiceProvider,
  FieldProvider,
  ProviderContext,
  ServiceProvider, isServiceInstance
} from "../../../../types";
import {isFunction} from "@vlegm/utils";
import {tuple} from "./tuple";
import {needsEntrypoint} from "./generateEntrypoints";

export function resolveProvider<T>(fieldProvider: FieldProvider<T> | undefined, context:ProviderContext): T  | undefined {
  if(isFunction(fieldProvider)) {
    return fieldProvider(context);
  }

  return fieldProvider;
}

function getVolumes(project:iProject, serviceProvider: ServiceProvider, context: ProviderContext) {
  const volumes = resolveProvider(serviceProvider.volumes as string[], context) || [];

  volumes.push(`./services/${context.name}:/mnt/host`)

  if(serviceProvider.mnts) {
    const linkVolumes = serviceProvider.mnts.map((link) => {
      const [serviceName] = tuple(link);
      return `./services/${serviceName}:/mnt/${serviceName}`;
    });

    volumes.push.apply(volumes, linkVolumes);
  }

  if(serviceProvider.mnts || Array.isArray(context.command)) {
    const entrypointName = `${context.name}-entrypoint.sh`;
    const entrypointPath = `./dist/${entrypointName}`;
    volumes.push(`${entrypointPath}:/mnt/entrypoint.sh`)
  }

  return volumes;
}

async function processService(project:iProject, serviceProvider:ServiceProvider, context:ProviderContext) {
  context.command = resolveProvider(serviceProvider.command, context) as string | string[] | undefined;

  const service = {
    ...serviceProvider,
    volumes: getVolumes(project, serviceProvider, context),
    command: !Array.isArray(context.command) ? context.command : undefined,
    image: resolveProvider(serviceProvider.image, context),
    build: resolveProvider(serviceProvider.build, context),
    working_dir: '/mnt/host'
  } as DockerService;

  if(needsEntrypoint(serviceProvider, context)) {
    service.entrypoint = "/mnt/entrypoint.sh";
  }

  return service;
}

export async function processServices(project:iProject, provider: ComposeProvider, options:StartOptions): Promise<Dict<DockerService>> {
  let services = {};

  for (const [serviceName, serviceDef] of Object.entries(provider.services || {})) {
    if(project.excluded.includes(serviceName)) {
      break;
    }

    const context:ProviderContext = {
      name: serviceName,
      options
    };

    if(isServiceProvider(serviceDef)) {
      services[serviceName] = await processService(project, serviceDef, context);
    }

    if(isServiceInstance(serviceDef)) {
      services[serviceName] = serviceDef.service(context);
    }

    if(services[serviceName] && options.hasEnvFile) {
      services[serviceName].env_file = `./dist/.env`;
    }
  }

  return services;
}