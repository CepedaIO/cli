import {
  StartOptions,
  Dict,
  DockerService,
  ProviderContext,
  NormalizedComposeProvider
} from "../../../../types";
import {iProject} from "../../models/Project";

export async function processServices(project:iProject, provider: NormalizedComposeProvider, options:StartOptions): Promise<Dict<DockerService>> {
  let services = {};

  for (const [serviceName, serviceInst] of Object.entries(provider.services || {})) {
    if(project.services.excluded.includes(serviceName)) {
      break;
    }

    const context:ProviderContext = {
      name: serviceName,
      options
    };

    if(serviceInst) {
      services[serviceName] = serviceInst.service(context);

      if(services[serviceName] && options.hasEnvFile) {
        services[serviceName].env_file = `./.dist/.env`;
      }
    }
  }

  return services;
}