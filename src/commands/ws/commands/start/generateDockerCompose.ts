import {
  CommandOptions,
  ComposeProvider,
  ProviderContext,
  isServiceProvider,
  DockerCompose, Dict, DockerService
} from "../../../../types";
import {Project} from "../../models/Project";
import {processServiceProvider} from "./processServiceProvider";

async function processServices(project:Project, env:string, providers: ComposeProvider['services'], commandOptions:CommandOptions): Promise<Dict<DockerService>> {
  let services = {};
  for (const [serviceName, provider] of Object.entries(providers)) {
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

export async function generateDockerCompose(project:Project, config:ComposeProvider, env:string, options:CommandOptions): Promise<DockerCompose> {
  const services = await processServices(project, env, config.services, options);

  return {
    ...config,
    services
  };
}
