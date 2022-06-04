import {BaseService} from "./Service";

interface Options {
  mnts?: string[];
  command?: string | string[];
  image?: string;
}

export class NodeJSService extends BaseService{
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

  addSource(url: string, init:string | string[] = 'yarn install') {
    this.sources.add({
      url,
      init
    });
  }
}