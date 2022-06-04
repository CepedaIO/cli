import {ServiceFactory} from "./ServiceFactory";

interface Options {
  npmLinks?: string[];
  command?: string | string[];
  image?: string;
}

export class NodeJSService extends ServiceFactory {
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

  addSource(url: string, init:string | string[] = 'yarn install') {
    super.addSource(url, init);
  }
}
