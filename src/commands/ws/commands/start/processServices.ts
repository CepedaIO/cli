import {
  StartOptions,
  Dict,
  DockerService,
  ProviderContext,
  NormalizedComposeProvider
} from "../../../../types";
import {existsSync} from "fs";
import {join} from "path";
import {iProject, Project} from "../../models/Project";

export async function processServices(project:iProject, provider: NormalizedComposeProvider, options:StartOptions): Promise<Dict<DockerService>> {
  let services = {};

  for (const [serviceName, serviceFactory] of Object.entries(provider.services || {})) {
    if(project.services.excluded.includes(serviceName)) {
      break;
    }

    const context:ProviderContext = {
      name: serviceName,
      options
    };

    if(serviceFactory) {
      const serviceDef = serviceFactory.service(context);

      if(!serviceDef.image && !serviceDef.build) {
        const servicePath = Project.pathFor(project, serviceName);
        const dockerfilePath = join(servicePath, 'Dockerfile');

        if(existsSync(dockerfilePath)) {
          serviceDef.build = `./services/${serviceName}`;
        } else if(serviceFactory.defaults && serviceFactory.defaults.runtime) {
          const runtime = serviceFactory.defaults.runtime(context);
          Object.entries(runtime).forEach(([key, value]) => serviceDef[key] = value);
        } else {
        
        }
      }

      services[serviceName] = serviceDef;

      if(services[serviceName] && options.hasEnvFile) {
        services[serviceName].env_file = `./.dist/.env`;
      }
    }
  }

  return services;
}
