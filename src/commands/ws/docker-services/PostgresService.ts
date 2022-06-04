import {Dict, DockerService, DockerVolume, ProviderContext, ServiceInstance} from "../../../types";

interface ServiceVariables {
  POSTGRES_HOST: string;
  POSTGRES_DB: string;
  POSTGRES_PORT: number;
  POSTGRES_USER: string;
  POSTGRES_PASSWORD: string;
}

interface ServiceOptions {
  port?: number;
  volumeName?: string;
  image?: string;
}

export class PostgresService implements ServiceInstance {
  constructor(
    public variables: ServiceVariables,
    public _options: ServiceOptions = {}
  ) {}

  get options(): Required<ServiceOptions> {
    return {
      image: this._options.image || 'postgres:14-alpine',
      port: this._options.port || 5432,
      volumeName: this._options.volumeName || 'postgres'
    };
  }

  env(context:ProviderContext) {
    return {
      ...this.variables
    };
  }

  service(context: ProviderContext): DockerService {
    return {
      image: this.options.image,
      ports: [
        `${this.options.port}:5432`
      ],
      volumes: [
        `${this.options.volumeName}:/var/lib/postgresql/data`
      ]
    }
  }

  volumes(context: ProviderContext): Dict<DockerVolume> {
    return {
      [this.options.volumeName]: {}
    }
  }
}