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
        'npm install',
        'npm dev'
      ],
      image: options.image || 'node:16-alpine'
    });
  }

  addSource(url: string, init:string | string[] = 'npm install') {
    this.provider.repo = { url, init };
  }
}
