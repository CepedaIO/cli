import {BaseService} from "./Service";

interface Options {
  npmLinks?: string[];
  command?: string | string[];
  image?: string;
}

export class NodeJSService extends BaseService {
  constructor(
    public port: number,
    public options: Options = {}
  ) {
    super({
      ports: [
        `${port}:${port}`
      ],
      npmLinks: options.npmLinks || [],
      command: options.command || [
        'yarn install',
        'yarn dev'
      ],
      image: options.image || 'node:16-alpine'
    });
  }

  addSource(url: string, init:string | string[] = 'yarn install') {
    this.sources.add({
      url,
      init
    });
  }
}