import {Service} from "./Service";

interface Options {
  mnts?: string[];
  command?: string | string[];
  image?: string;
}

export class NodeService extends Service {
  constructor(
    public port: number,
    public options: Options = {}
  ) {
    super({
      ports: [
        `${port}:${port}`
      ],
      mnts: options.mnts || [],
      command: options.command || [
        'yarn install',
        'yarn dev'
      ],
      image: options.image || 'vlegm/dev-alpine:latest'
    });
  }
}