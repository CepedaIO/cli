import {DockerService, NormalizedComposeProvider, ProviderContext, StartOptions} from "../../../../types";
import {iProject, Project} from "../../models/Project";
import {join} from "path";
import {existsSync} from "fs";
import Dict = NodeJS.Dict;

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

            // Normalize multi-command arrays into a single shell invocation.
            // Docker Compose "command: [a, b]" does NOT mean "run a then b".
            // Also avoid relying on `entrypoint` (it may be stripped by schema sanitization).
            if (Array.isArray(serviceDef.command) && serviceDef.command.length > 1) {
                const commands = serviceDef.command.map((c) => String(c).trim()).filter(Boolean);
                const last = commands[commands.length - 1];
                const prefix = commands.slice(0, -1);

                const chained = prefix.length > 0
                    ? `${prefix.join(' && ')} && exec ${last}`
                    : `exec ${last}`;

                serviceDef.command = ['sh', '-lc', chained] as any;
            }

            services[serviceName] = serviceDef;

            if(services[serviceName] && options.hasEnvFile) {
                services[serviceName].env_file = `./.dist/.env`;
            }
        }
    }

    return services;
}