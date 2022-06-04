import {iProject} from "../../models/Project";
import {
  StartOptions,
  ComposeProvider, Dict,
  DockerService, isServiceProvider,
  FieldProvider,
  ProviderContext,
  ServiceProvider
} from "../../../../types";
import {normalize} from "path";
import {chmod, writeFile} from "fs/promises";
import {isFunction} from "@vlegm/utils";
import {entrypointActionsFromLinks} from "./entrypointActionsFromLinks";
import {tuple} from "./tuple";
import dockerServices from "../../dockerServices";

function resolveProvider<T>(fieldProvider: FieldProvider<T> | undefined, context:ProviderContext): T  | undefined {
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

async function generateEntrypointFile(project: iProject, provider: ServiceProvider, service: DockerService, context:ProviderContext) {
  let actions: string[] = [];

  if(provider.mnts) {
    actions = await entrypointActionsFromLinks(project, provider, service);
  }

  if(Array.isArray(context.command)) {
    actions.push.apply(actions, context.command);
  }

  if(actions.length > 0) {
    if(typeof context.command === "string") {
      actions.push(context.command);
    }

    if(service.entrypoint) {
      actions.push(`sh ${service.entrypoint}`);
    }

    actions.unshift('#!/usr/bin/env sh');

    const entrypointName = `${context.name}-entrypoint.sh`;
    const entrypointPath = normalize(`${project.root}/dist/${entrypointName}`);
    await writeFile(entrypointPath, actions.join('\n'));
    await chmod(entrypointPath, "755");

    service.entrypoint = "/mnt/entrypoint.sh";
  }
}

async function processService(project:iProject, provider:ServiceProvider, context:ProviderContext) {
  context.command = resolveProvider(provider.command, context) as string | string[] | undefined;

  const service = {
    ...provider,
    volumes: getVolumes(project, provider, context),
    command: !Array.isArray(context.command) ? context.command : undefined,
    image: resolveProvider(provider.image, context),
    build: resolveProvider(provider.build, context),
    working_dir: '/mnt/host'
  } as DockerService;

  await generateEntrypointFile(project, provider, service, context);

  return service;
}

export async function processServices(project:iProject, env:string, provider: ComposeProvider, options:StartOptions): Promise<Dict<DockerService>> {
  let services = {};

  for (const [serviceName, serviceProvider] of Object.entries(provider.services || {})) {
    if(project.excluded.includes(serviceName)) {
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