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
    const provider = {
      ports: [
        `${port}:${port}`
      ],
      npmLinks: options.npmLinks || [],
      command: options.command,
      image: options.image
    };

    if(!options.command && !options.image) {
      provider.command = [
        'yarn install',
        'yarn dev'
      ];

      provider.image = 'node:16-alpine';
    }

    super(provider);
  }

  addSource(url: string, init:string | string[] = 'npm install') {
    this.provider.repo = { url, init };
  }
}
