import {
  NormalizedComposeProvider,
  ProviderContext,
  StartOptions
} from "../../../../types";
import {tuple} from "./tuple";
import {normalize} from "path";
import {chmod, writeFile} from "fs/promises";
import {Service} from "../../docker-services";
import {distDir} from "../../../../config/app";

function entrypointActionsFromLinks(instance: Service): string[] {
  const npmLinks = instance.npmLinks();

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

function generateEntrypointLines(instance: Service, context:ProviderContext) {
  let actions: string[] = entrypointActionsFromLinks(instance);
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

export async function generateEntrypoint(provider: NormalizedComposeProvider, options: StartOptions) {
  for(const [serviceName, serviceDef] of Object.entries(provider.services)) {
    if(serviceDef instanceof Service) {
      const context:ProviderContext = {
        name: serviceName,
        options
      };

      if(serviceDef.needsEntrypoint(context)) {
        const lines = generateEntrypointLines(serviceDef, context);
        const entrypointName = `${context.name}-entrypoint.sh`;
        const entrypointPath = normalize(`${distDir(options.root)}/${entrypointName}`);
        await writeFile(entrypointPath, lines.join('\n'));
        await chmod(entrypointPath, "755");
      }
    }
  }
}