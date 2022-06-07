import {Dict, DockerService, DockerVolume, ProviderContext, iServiceResolver} from "../../../types";

interface ServiceOptions {
  volumeName?: string;
  image?: string;
}

interface RedisVariables {
  REDIS_PORT: number;
}

export function Redis(variables: RedisVariables, options: ServiceOptions = {}): iServiceResolver {
  const volumeName = options.volumeName || 'redis';

  return {
    env(context: ProviderContext) {
      return {
        ...variables
      };
    },

    service(context: ProviderContext): DockerService {
      return {
        image: options.image || 'redis:6-alpine',
        ports: [
          `${variables.REDIS_PORT}:6379`
        ],
        volumes: [
          `${volumeName}:/data`
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
