import {iProject} from "../../models/Project";
import {DockerService, Provider, ProviderContext, ServiceProvider} from "../../../../types";
import {normalize} from "path";
import {chmod, writeFile} from "fs/promises";
import {isFunction} from "@vlegm/utils";
import {entrypointActionsFromLinks} from "./entrypointActionsFromLinks";
import {tuple} from "./tuple";
import {removeFields} from "../../services/removeFields";

function resolveProvider<T>(provider: Provider<T> | undefined, context:ProviderContext): T  | undefined {
  if(isFunction(provider)) {
    return provider(context);
  }

  return provider;
}

function getVolumes(project:iProject, provider: ServiceProvider, context: ProviderContext) {
  const volumes = resolveProvider(provider.volumes as string[], context) || [];

  volumes.push(`./${context.name}:/mnt/host`)

  if(provider.links) {
    const linkVolumes = provider.links.map((link) => {
      const [serviceName] = tuple(link);
      return `${normalize(project.root)}/${serviceName}:/mnt/${serviceName}`;
    });
    volumes.push.apply(volumes, linkVolumes);

    const entrypointName = `${context.name}-entrypoint.sh`;
    const entrypointPath = normalize(`${project.root}/${entrypointName}`);
    volumes.push(`${entrypointPath}:/mnt/entrypoint.sh`)
  }

  return volumes;
}

async function generateEntrypointFile(project: iProject, provider: ServiceProvider, service: DockerService) {
  if(provider.links) {
    const entrypointName = `${context.name}-entrypoint.sh`;
    const entrypointPath = normalize(`${project.root}/${entrypointName}`);
    const actions = await entrypointActionsFromLinks(project, provider, service);
    await writeFile(entrypointPath, actions.join('\n'));
    await chmod(entrypointPath, "755");

    service.entrypoint = "/mnt/entrypoint.sh";
  }
}

export async function processServiceProvider(project:iProject, provider:ServiceProvider, context:ProviderContext) {
  const service = removeFields({
    ...provider,
    volumes: getVolumes(project, provider, context),
    command: resolveProvider(provider.command, context),
    image: resolveProvider(provider.image, context),
    dockerfile: resolveProvider(provider.dockerfile, context),
    working_dir: '/mnt/host'
  }, ['repo', 'links']) as DockerService;

  await generateEntrypointFile(project, provider, service);

  return service;
}