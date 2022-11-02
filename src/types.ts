import { DockerService, DockerVolume } from "./docker-compose";
import {iProject} from "./commands/ws/models/Project";

export * from "./docker-compose";

export interface Dict<T> {
  [key: string]: T | undefined;
}

export type ShellCommand = string | string[];
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequireBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>
export type Tuple<T, K = T> = [T, K];
export type Linkable = RepoInfo;

export interface RepoInfo {
  url: string;
  init?: ShellCommand;
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

export function isServiceFactory(obj:any): obj is iServiceResolver {
  return obj.env && obj.service;
}

export function isEntrypointFactory(obj: any): obj is iEntrypointFactory {
  return typeof obj.needsEntrypoint === 'function' && typeof obj.entrypointLines === 'function';
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
  repo?: RepoInfo; /* Will clone repo into services folder and then mnt into container at /mnt/host */
  npmLinks?: string[]; /* WARNING: This will override the entrypoint in order to issue linking commands */
  include?: string[]; /* Will mount directories relative to (and instead of) CWD */
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
  services?: Dict<ServiceProvider | iServiceResolver>;
  volumes?: Dict<DockerVolume>;
}

export interface NormalizedComposeProvider extends ComposeProvider {
  services: Dict<iServiceResolver>;
}

export interface ServiceProviderDefaults {
  runtime?(context:ProviderContext): Pick<DockerService, 'image' | 'build' | 'command'>;
  repo?: { init: ShellCommand };
}

export interface iServiceResolver {
  name?: string;
  source?: RepoInfo;
  defaultRuntime?:(context:ProviderContext) => Pick<DockerService, 'image' | 'build' | 'command'>;
  defaults?: ServiceProviderDefaults;
  env?(context: ProviderContext): Dict<string | number>;
  service(context: ProviderContext): DockerService;
  volumes?(context:ProviderContext): Dict<DockerVolume>;
}

export interface iEntrypointFactory {
  needsEntrypoint(context: ProviderContext): boolean;
  entrypointLines(project:iProject, context: ProviderContext): Promise<string[]>;
}
