import {RepoInfo} from "../../../types";

export const sources:Map<string, RepoInfo> = new Map();

export function addSource(serviceName:string, source: RepoInfo) {
  sources.set(serviceName, source);
}

export function addNodeJSSource(serviceName: string, url: string, init: string | string[] = 'yarn install') {
  addSource(serviceName, { url, init });
}

export const compose = {

}