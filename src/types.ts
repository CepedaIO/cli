import { DockerService, DockerVolume } from "./docker-compose";
import dockerServices from "./commands/ws/dockerServices";

export * from "./docker-compose";

export interface Dict<T> {
  [key: string]: T | undefined;
}

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequireBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

export interface RepoInfo {
  url: string;
  init?: string;
}

export interface StartOptions {
  build: boolean;
  generate: boolean;
}

export function isRepoReference(obj:any): obj is isRepoReference {
  return typeof obj.repo === "object";
}

export function isServiceProvider(obj:any): obj is ServiceProvider {
  return obj.image || obj.dockerfile;
}

export interface WorkstationAnswers {
  name: string;
  root: string;
  repos?: RepoInfo[];
  services?: string[];
  env?: Dict<string>;
}

export type Provider<T> = T | ((context: ProviderContext) => T);
export type MapAsProvider<T, K extends keyof T> = Omit<T, K> & {
  [Key in K]: Provider<T[K]>
} & ServiceProviderOptionals;

export interface ServiceProviderOptionals {
  repo?: RepoInfo
  mnts?: string[]; /* WARNING: This will override the entrypoint in order to issue linking commands */
}

export type ServiceProvider = MapAsProvider<DockerService, 'command' | 'image' | 'build' | 'volumes'>
export type isRepoReference = RequireBy<ServiceProvider, 'repo'>;

export interface CommandOptions {
  test: boolean;
}

export interface ProviderContext {
  name: string;
  env: string;
  options: StartOptions;
}

export interface ComposeProvider {
  version: string;
  env?: Dict<string>,
  predefined?: string[],
  services?: Dict<ServiceProvider>;
  volumes?: Dict<DockerVolume>;
}
