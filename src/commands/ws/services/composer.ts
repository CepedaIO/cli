import {RepoInfo} from "../../../types";

export class Composer {
  private sources: Map<string, RepoInfo> = new Map();

  addSource(serviceName:string, source: RepoInfo) {
    this.sources.set(serviceName, source);
  }

  addNodeJSSource(serviceName: string, url: string, init: string | string[] = '%PACKAGE_MANAGER% install') {
    this.addSource(serviceName, { url, init });
  }

  getSources(): Map<string, RepoInfo> {
    return this.sources;
  }
}

export const composer = new Composer()
