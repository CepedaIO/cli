import {Dict, DockerService, DockerVolume, ProviderContext, ServiceInstance} from "../../../types";

interface ServiceOptions {
  port?: number;
  volumeName?: string;
  image?: string;
}

export class RedisService implements ServiceInstance {
  constructor(
    public _options: ServiceOptions = {}
  ) {}

  get options(): Required<ServiceOptions> {
    return {
      image: this._options.image || 'redis:5.0.7',
      port: this._options.port || 6379,
      volumeName: this._options.volumeName || 'redis'
    };
  }

  service(context: ProviderContext): DockerService {
    return {
      image: this.options.image,
      ports: [
        `${this.options.port}:6379`
      ],
      volumes: [
        `${this.options.volumeName}:/data`
      ]
    }
  }

  volumes(context: ProviderContext): Dict<DockerVolume> {
    return {
      [this.options.volumeName]: {}
    }
  }
}