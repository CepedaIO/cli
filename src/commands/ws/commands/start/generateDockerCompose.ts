import {
  CommandOptions,
  ComposeProvider,
  ProviderContext,
  isServiceProvider,
  Dict
} from "../../../../types";
import {iProject} from "../../models/Project";
import {processServiceProvider} from "./processServiceProvider";
import {validateSchema} from "../../services/validateSchema";
import {readFile} from "fs/promises";
import {assetsDir} from "../../../../config/app";
import {DockerCompose, DockerService} from "../../../../docker-compose";
import chalk from "chalk";

async function processServices(project:iProject, env:string, providers: ComposeProvider['services'], commandOptions:CommandOptions): Promise<Dict<DockerService>> {
  let services = {};
  for (const [serviceName, provider] of Object.entries(providers || {})) {
    if(isServiceProvider(provider)) {
      const context:ProviderContext = {
        name: serviceName,
        env,
        commandOptions
      };

      services[serviceName] = await processServiceProvider(project, provider, context);
    }
  }

  return services;
}

export async function generateDockerCompose(project:iProject, config:ComposeProvider, env:string, options:CommandOptions): Promise<DockerCompose> {
  const services = await processServices(project, env, config.services, options);
  const schemaBuffer = await readFile(`${assetsDir}/docker-compose.schema.json`);
  const schema = JSON.parse(schemaBuffer.toString('utf-8'));

  const result = validateSchema({
    ...config,
    services
  }, schema, {
    filterAdditionalProperties: true,
    allErrors: true
  });

  if(result.errors.length > 0) {
    console.log(`Generated compose file ${chalk.redBright('invalid')}:`);
    console.log(result.errors);
  }

  return result.result as DockerCompose;
}
