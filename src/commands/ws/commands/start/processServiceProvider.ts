import {Project} from "../../models/Project";
import {DockerService, Provider, ProviderContext, ServiceProvider} from "../../../../types";
import {normalize} from "path";
import {chmod, writeFile} from "fs/promises";
import {isFunction} from "@vlegm/utils";
import {entrypointActionsFromLinks} from "./entrypointActionsFromLinks";
import {tuple} from "./tuple";

function getLinksAsMounts(project:Project, service: ServiceProvider): string[] {
  return service.links.map((link) => {
    const [serviceName] = tuple(link);
    return `${normalize(project.root)}/${serviceName}:/mnt/${serviceName}`;
  });
}

function removeUndefined(obj: Object, fields: string[]): Object {
  return Object.entries(obj).reduce((res, [field, value]) => {
    if(value !== null && value !== undefined && !fields.includes(field)) {
      res[field] = value;
    }

    return res;
  }, {});
}

function resolveProvider<T>(provider: Provider<T> | undefined, context:ProviderContext): T  | undefined {
  if(isFunction(provider)) {
    return provider(context);
  }

  return provider;
}

export async function processServiceProvider(project:Project, provider:ServiceProvider, context:ProviderContext) {
  const service = removeUndefined({
    volumes:[],
    ...provider,
    working_dir: '/mnt/host',
    command: resolveProvider(provider.command, context),
    image: resolveProvider(provider.image, context),
    dockerfile: resolveProvider(provider.dockerfile, context)
  }, ['repo', 'links']) as DockerService;

  service.volumes = [
    ...service.volumes,
    `./${context.name}:/mnt/host`
  ]

  if(provider.links) {
    const linkVolumes = getLinksAsMounts(project, provider);

    service.volumes = [
      ...service.volumes,
      ...linkVolumes
    ];

    const entrypointName = `${context.name}-entrypoint.sh`;
    const actions = await entrypointActionsFromLinks(project, provider, service);
    const entrypointPath = normalize(`${project.root}/${entrypointName}`);
    await writeFile(entrypointPath, actions.join('\n'));
    await chmod(entrypointPath, "755");

    service.volumes.push(`${entrypointPath}:/mnt/entrypoint.sh`)
    service.entrypoint = "/mnt/entrypoint.sh";
  }

  return service;
}