import { DockerService, DockerVolume } from "./docker-compose";

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
  env: string;
  build: boolean;
  generate: boolean;
  hasEnvFile: boolean;
}

export function isRepoReference(obj:any): obj is isRepoReference {
  return typeof obj.repo === "object";
}

export function isServiceProvider(obj:any): obj is ServiceProvider {
  return obj.image || obj.build;
}

export function isServiceInstance(obj:any): obj is ServiceInstance {
  return obj.env && obj.service;
}

export interface WorkstationAnswers {
  name: string;
  root: string;
  repos?: RepoInfo[];
  services?: string[];
  env?: Dict<string>;
}

export type FieldProvider<T> = T | ((context: ProviderContext) => T);
export type MapAsProvider<T, K extends keyof T> = Omit<T, K> & {
  [Key in K]: FieldProvider<T[K]>
} & ServiceProviderOptionals;

export interface ServiceProviderOptionals {
  env?: Dict<string | number>;
  repo?: RepoInfo
  mnts?: string[]; /* WARNING: This will override the entrypoint in order to issue linking commands */
}

type _ServiceProvider = MapAsProvider<DockerService, 'command' | 'image' | 'build' | 'volumes'>;
export type ServiceProvider = Omit<_ServiceProvider, 'env_file'>;
export type isRepoReference = RequireBy<ServiceProvider, 'repo'>;

export interface ProviderContext {
  name: string;
  options: StartOptions;
  command?: string | string[];
}

export interface ComposeProvider {
  version: string;
  env?: Dict<string | number>;
  predefined?: string[];
  services?: Dict<ServiceProvider | ServiceInstance>;
  volumes?: Dict<DockerVolume>;
}

export interface ServiceInstance {
  env?(context: ProviderContext): Dict<string | number>;
  service(context: ProviderContext): DockerService;
  volumes?(context:ProviderContext): Dict<DockerVolume>;
}