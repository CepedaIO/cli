import {
  ComposeProvider,
  isServiceProvider,
  ProviderContext,
  ServiceProvider,
  StartOptions
} from "../../../../types";
import {tuple} from "./tuple";
import {normalize} from "path";
import {chmod, writeFile} from "fs/promises";
import {iProject} from "../../models/Project";
import {resolveProvider} from "./processServices";

function hasNPMLinks(serviceProvider: ServiceProvider): boolean {
  if(!serviceProvider.mnts) {
    return false;
  }

  const npmLinks = getNPMLinks(serviceProvider);
  return npmLinks.length > 0;
}

function getNPMLinks(serviceProvider: ServiceProvider): string[] {
  if(!serviceProvider.mnts) {
    return [];
  }

  return serviceProvider.mnts.filter((link) => {
    const [,linkName] = tuple(link);
    return !!linkName;
  });
}

function entrypointActionsFromLinks(serviceProvider: ServiceProvider): string[] {
  if(!serviceProvider.mnts) {
    return [];
  }

  const npmLinks = getNPMLinks(serviceProvider);

  let actions = [
    'cwd=$PWD'
  ];

  actions = actions.concat(npmLinks.map((link) => {
    const [serviceName] = tuple(link);
    return `cd /mnt/${serviceName} && yarn link`;
  }));

  actions.push(`cd $cwd`);

  actions = actions.concat(npmLinks.map((link) => {
    const [,linkName] = tuple(link);
    return `yarn link ${linkName}`;
  }));

  return actions;
}

function generateEntrypointLines(provider: ServiceProvider, context:ProviderContext) {
  let actions: string[] = [];
  const command = resolveProvider(provider.command, context);

  if(provider.mnts) {
    actions = entrypointActionsFromLinks(provider);
  }

  if(Array.isArray(command)) {
    actions = actions.concat(command as string[]);
  }

  if(actions.length > 0) {
    if(typeof command === "string") {
      actions.push(command);
    }

    if(provider.entrypoint) {
      actions.push(`sh ${provider.entrypoint}`);
    }

    actions.unshift('#!/usr/bin/env sh');
  }

  return actions;
}

export function needsEntrypoint(serviceProvider:ServiceProvider, context: ProviderContext) {
  const command = resolveProvider(serviceProvider.command, context);
  return hasNPMLinks(serviceProvider) || Array.isArray(command);
}

export async function generateEntrypoint(project:iProject, provider: ComposeProvider, options: StartOptions) {
  for(const [serviceName, serviceDef] of Object.entries((provider.services || {}))) {
    const context:ProviderContext = {
      name: serviceName,
      options
    };

    if(isServiceProvider(serviceDef) && needsEntrypoint(serviceDef, context)) {
      const lines = generateEntrypointLines(serviceDef, context);

      const entrypointName = `${context.name}-entrypoint.sh`;
      const entrypointPath = normalize(`${project.root}/dist/${entrypointName}`);
      await writeFile(entrypointPath, lines.join('\n'));
      await chmod(entrypointPath, "755");
    }
  }
}