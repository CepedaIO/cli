import {Dict, DockerService, DockerVolume, ProviderContext, iServiceResolver} from "../../../types";

interface ServiceVariables {
  PGADMIN_PORT: number;
  PGADMIN_DEFAULT_EMAIL: string;
  PGADMIN_DEFAULT_PASSWORD: string;
}
interface ServiceOptions {
  volumeName?: string;
  image?: string;
}

export function PGAdmin(variables: ServiceVariables, options: ServiceOptions = {}): iServiceResolver {
  const volumeName = options.volumeName || 'pgadmin';

  return {
    env(context:ProviderContext) {
      return {
        ...variables
      };
    },

    service(context: ProviderContext): DockerService {
      return {
        image: options.image || 'dpage/pgadmin4:latest',
        ports: [
          `${variables.PGADMIN_PORT}:80`
        ],
        volumes: [
          `${volumeName}:/var/lib/pgadmin`
        ]
      }
    },

    volumes(context: ProviderContext): Dict<DockerVolume> {
      return {
        [volumeName]: {}
      }
    }
  }
}
