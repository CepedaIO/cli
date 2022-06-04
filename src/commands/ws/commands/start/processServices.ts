import {
  StartOptions,
  Dict,
  DockerService,
  ProviderContext,
  NormalizedComposeProvider
} from "../../../../types";

export async function processServices(provider: NormalizedComposeProvider, options:StartOptions): Promise<Dict<DockerService>> {
  let services = {};

  for (const [serviceName, serviceDef] of Object.entries(provider.services || {})) {
    if(options.excluded.includes(serviceName)) {
      break;
    }

    const context:ProviderContext = {
      name: serviceName,
      options
    };

    if(serviceDef) {
      services[serviceName] = serviceDef.service(context);

      if(services[serviceName] && options.hasEnvFile) {
        services[serviceName].env_file = `./.dist/.env`;
      }
    }
  }

  return services;
}