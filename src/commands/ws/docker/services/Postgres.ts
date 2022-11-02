import {Dict, DockerService, DockerVolume, ProviderContext, iServiceResolver} from "../../../../types";

interface ServiceVariables {
  POSTGRES_HOST: string;
  POSTGRES_DB: string;
  POSTGRES_PORT: number;
  POSTGRES_USER: string;
  POSTGRES_PASSWORD: string;
}

interface ServiceOptions {
  volumeName?: string;
  image?: string;
}

export function Postgres(variables:ServiceVariables, options: ServiceOptions = {}): iServiceResolver {
  const volumeName = options.volumeName || 'postgres';

  return {
    env(context: ProviderContext) {
      return {
        ...variables
      };
    },

    service(context: ProviderContext): DockerService {
      return {
        image: options.image || 'postgres:14-alpine',
        ports: [
          `${variables.POSTGRES_PORT}:5432`
        ],
        volumes: [
          `${volumeName}:/var/lib/postgresql/data`
        ]
      }
    },

    volumes(context: ProviderContext): Dict<DockerVolume> {
      return {
        [volumeName]: {}
      }
    }
  };
};
