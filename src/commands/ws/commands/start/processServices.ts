import {iProject} from "../../models/Project";
import {
  StartOptions,
  ComposeProvider, Dict,
  DockerService, isServiceProvider,
  Provider,
  ProviderContext,
  ServiceProvider
} from "../../../../types";
import {normalize} from "path";
import {chmod, writeFile} from "fs/promises";
import {isFunction} from "@vlegm/utils";
import {entrypointActionsFromLinks} from "./entrypointActionsFromLinks";
import {tuple} from "./tuple";
import dockerServices from "../../dockerServices";

function resolveProvider<T>(provider: Provider<T> | undefined, context:ProviderContext): T  | undefined {
  if(isFunction(provider)) {
    return provider(context);
  }

  return provider;
}

function getVolumes(project:iProject, provider: ServiceProvider, context: ProviderContext) {
  const volumes = resolveProvider(provider.volumes as string[], context) || [];

  volumes.push(`./services/${context.name}:/mnt/host`)

  if(provider.mnts) {
    const linkVolumes = provider.mnts.map((link) => {
      const [serviceName] = tuple(link);
      return `./services/${serviceName}:/mnt/${serviceName}`;
    });
    volumes.push.apply(volumes, linkVolumes);

    const entrypointName = `${context.name}-entrypoint.sh`;
    const entrypointPath = `./dist/${entrypointName}`;
    volumes.push(`${entrypointPath}:/mnt/entrypoint.sh`)
  }

  return volumes;
}

async function generateEntrypointFile(project: iProject, provider: ServiceProvider, service: DockerService, context:ProviderContext) {
  if(provider.mnts) {
    const entrypointName = `${context.name}-entrypoint.sh`;
    const entrypointPath = normalize(`${project.root}/dist/${entrypointName}`);
    const actions = await entrypointActionsFromLinks(project, provider, service);
    await writeFile(entrypointPath, actions.join('\n'));
    await chmod(entrypointPath, "755");

    service.entrypoint = "/mnt/entrypoint.sh";
  }
}

async function processService(project:iProject, provider:ServiceProvider, context:ProviderContext) {
  const service = {
    ...provider,
    volumes: getVolumes(project, provider, context),
    command: resolveProvider(provider.command, context),
    image: resolveProvider(provider.image, context),
    build: resolveProvider(provider.build, context),
    working_dir: '/mnt/host'
  } as DockerService;

  await generateEntrypointFile(project, provider, service, context);

  return service;
}

export async function processServices(project:iProject, env:string, provider: ComposeProvider, options:StartOptions): Promise<Dict<DockerService>> {
  let services = {};
  const excludes = options.exclude.split(',');

  for (const [serviceName, serviceProvider] of Object.entries(provider.services || {})) {
    if(excludes.includes(serviceName)) {
      break;
    }

    if(isServiceProvider(serviceProvider)) {
      const context:ProviderContext = {
        name: serviceName,
        env,
        options
      };

      services[serviceName] = await processService(project, serviceProvider, context);
    }
  }

  const predefinedServices = provider.predefined?.reduce((res, serviceName) => ({
    ...res,
    [serviceName]: dockerServices[serviceName]
  }), {});

  return {
    ...services,
    ...predefinedServices
  };
}