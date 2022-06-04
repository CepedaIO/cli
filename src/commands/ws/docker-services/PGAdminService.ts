import {Dict, DockerService, DockerVolume, ProviderContext, ServiceInstance} from "../../../types";

interface ServiceVariables {
  PGADMIN_DEFAULT_EMAIL: string;
  PGADMIN_DEFAULT_PASSWORD: string;
}
interface ServiceOptions {
  port: number;
  volumeName?: string;
  image?: string;
}

export class PGAdminService implements ServiceInstance {
  constructor(
    public variables: ServiceVariables,
    public _options: ServiceOptions
  ) {}

  get options(): Required<ServiceOptions> {
    return {
      image: this._options.image || 'dpage/pgadmin4:latest',
      port: this._options.port,
      volumeName: this._options.volumeName || 'pgadmin'
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
        `${this.options.port}:80`
      ],
      volumes: [
        `${this.options.volumeName}:/var/lib/pgadmin`
      ]
    }
  }

  volumes(context: ProviderContext): Dict<DockerVolume> {
    return {
      [this.options.volumeName]: {}
    }
  }
}