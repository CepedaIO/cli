import dockerServices from "./commands/ws/dockerServices";

export interface Dict<T> {
  [key: string]: T | undefined;
}

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequireBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

export interface RepoInfo {
  url: string;
  init?: string;
}

export function isServiceFromRepo(obj:any): obj is ServiceFromRepo {
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

export type Path = string;
export type Provider<T> = T | ((context: ProviderContext) => T);
export type MapAsProvider<T, K extends keyof T> = Omit<T, K> & {
  [Key in K]: Provider<T[K]>
} & ServiceProviderOptionals;

export interface DockerService {
  env_file?: Path;
  tty?: boolean;
  command?: string | string[];
  ports?: string[];
  volumes?: string[];
  working_dir?: Path;
  image?: string;
  dockerfile?: string;
  entrypoint?: string;
}

export interface ServiceProviderOptionals {
  repo?: RepoInfo
  links?: string[]; /* WARNING: This will override the entrypoint in order to issue linking commands */
}

export type ServiceProvider = MapAsProvider<DockerService, 'command' | 'image' | 'dockerfile'>
export type ServiceFromRepo = RequireBy<ServiceProvider, 'repo'>;

export interface CommandOptions {
  test: boolean;
}

export interface ProviderContext {
  name: string;
  env: string;
  commandOptions: CommandOptions;
}

export interface DockerVolume {

}

export interface DockerCompose {
  version: string;
  services: Dict<DockerService>;
  volumes?: Dict<DockerVolume>;
}

export interface ComposeProvider {
  version: string;
  predefined?: Array<keyof typeof dockerServices>,
  services?: Dict<ServiceProvider>;
  volumes?: Dict<DockerVolume>;
}
