import { DockerService, DockerVolume } from "./docker-compose";
import {BaseService} from "./commands/ws/docker-services";

export * from "./docker-compose";

export interface Dict<T> {
  [key: string]: T | undefined;
}

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequireBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

export interface RepoInfo {
  url: string;
  init?: string | string[];
}

export interface PortBind {
  host: number;
  container: number;
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

export function isRepoInfo(obj:any): obj is RepoInfo {
  return typeof obj.url === 'string';
}

export function isServiceProvider(obj:any): obj is ServiceProvider {
  return obj.image || obj.build;
}

export function isServiceInstance(obj:any): obj is ServiceFactory {
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
  [Key in K]: FieldProvider<T[Key]>
} & ServiceProviderOptionals;

export interface ServiceProviderOptionals {
  env?: Dict<string | number>;
  repo?: RepoInfo;
  npmLinks?: string[]; /* WARNING: This will override the entrypoint in order to issue linking commands */
}

export type ServiceProviderKeys = 'command' | 'image' | 'build' | 'volumes'
export type ServiceProvider = Omit<MapAsProvider<DockerService, ServiceProviderKeys>, 'env_file'>;
export type isRepoReference = RequireBy<ServiceProvider, 'repo'>;

export interface ProviderContext {
  name: string;
  options: StartOptions;
  needsEntrypoint?: boolean;
}

export interface ComposeProvider {
  version: string;
  env?: Dict<string | number>;
  predefined?: string[];
  services?: Dict<ServiceProvider | ServiceFactory>;
  volumes?: Dict<DockerVolume>;
}

export interface NormalizedComposeProvider extends ComposeProvider {
  services: Dict<ServiceFactory>;
}

export interface ServiceFactory {
  source?: RepoInfo;
  env?(context: ProviderContext): Dict<string | number>;
  service(context: ProviderContext): DockerService;
  volumes?(context:ProviderContext): Dict<DockerVolume>;
}
