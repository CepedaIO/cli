import {
	RepoInfo,
	Tuple
} from "../../../types";
import {Env} from "../docker";

type CommandManager = {
	run: string[];
}

type CommandFunctionArgs = ({
	manager: CommandManager
}) => string[]

type CommandFunction = ({})

export function isProviderFactory(obj:any): obj is ServiceProvider {
	return !!obj.provider && !!obj.base && !!obj.defaults && typeof obj.npmLink === 'function';
}

export interface IServiceResolver {
	getServiceConfig(env: Env): IServiceConfig;
}

export interface IManager {
	run: (command: string) => string;
}

export interface CommandOptions {
	manager: IManager;
}
export interface IEnvServiceConfig {
	links: ServiceProvider[];
	mounts: ServiceProvider[];
	commands: string[] | CommandFunctionArgs;
	ports: Tuple<number>[];
	includes: string[];
	variables: Tuple<string>[];
	inits: string[];
}

export interface ResolvedEnvServiceConfig extends IEnvServiceConfig {
	commands: string[];
}

export interface IServiceConfig extends IEnvServiceConfig {
	source: RepoInfo;
	workDir?: string;
	runtime?: string;
}

export class EnvServiceProvider {
	public config: IEnvServiceConfig;
	public then = this;
	
	constructor(
		config: Partial<IEnvServiceConfig> = {}
	) {
		this.config = {
			links: [],
			mounts: [],
			commands: [],
			ports: [],
			includes: [],
			variables: [],
			inits: [],
			...config
		};
	}

	link(...services: ServiceProvider[]): EnvServiceProvider {
		this.config.links = this.config.links.concat(services);
		return this;
	}
	
	mount(...dirs: ServiceProvider[]): EnvServiceProvider {
		this.config.mounts = this.config.mounts.concat(dirs);
		return this;
	}
	
	run(...commands: string[]): EnvServiceProvider {
		if(typeof this.config.commands === 'function') {
			this.config.commands = this.config.commands({
				manager: []
			})
		} else if(Array.isArray(this.config.commands)) {
			this.config.commands = this.config.commands.concat(commands);
		}
		
		
		return this;
	}
	
	init(...inits: string[]): EnvServiceProvider {
		this.config.inits = this.config.inits.concat(inits);
		
		return this;
	}
	
	port(...ports: Array<number | Tuple<number>>): EnvServiceProvider {
		ports.forEach((port) => {
			if(Array.isArray(port)) {
				this.config.ports = this.config.ports.concat(port);
			} else {
				this.config.ports = this.config.ports.concat([port, port]);
			}
		});
		
		return this;
	}
	
	include(...includes: Array<string>): EnvServiceProvider {
		this.config.includes = this.config.includes.concat(includes);
		
		return this;
	}
	
	variables(...variables: Tuple<string>[]): EnvServiceProvider {
		this.config.variables = this.config.variables.concat(variables);
		
		return this;
	}
	
	needsEntrypoint(): boolean {
		return this.config.links.length > 0 || this.config.commands.length > 0;
	}
}

export class ServiceProvider extends EnvServiceProvider implements IServiceResolver {
	public name:string = '';
	public environments: Map<Env, EnvServiceProvider> = new Map();
	declare public config: IServiceConfig;
	private merge: Array<keyof IEnvServiceConfig> = [
		'variables',
		'includes',
		'ports',
		'links',
		'mounts',
		'inits'
	];
	public defaults: Partial<IServiceConfig> = {};
	
	constructor(
		source: RepoInfo,
		config: Partial<IEnvServiceConfig> = {},
		defaults: Partial<IServiceConfig> = {}
	) {
		super(config);
		this.config.source = source;
		this.defaults = defaults;
	}
	
	getServiceConfig(env: Env): IServiceConfig {
		if(!this.environments.has(env)) {
			throw new Error(`Not environment configured for: ${env.name}`);
		}
		const envConfig = this.environments.get(env)!;
		const globalConfig = this.config;
		
		return Object.entries(envConfig).reduce((result, [key, value]) => {
			// @ts-ignore
			if(this.merge.includes(key)) {
				result[key] = value.concat(this.config[key]);
			} else {
				result[key] = value || this.config[key];
			}
			
			return result;
		}, {} as IServiceConfig);
	}
	
	env(env: Env, configure: (service: EnvServiceProvider) => void): ServiceProvider {
		const service = new EnvServiceProvider();
		configure(service);
		this.environments.set(env, service);
		
		return this;
	}
	
	runtime(runtime: string): ServiceProvider {
		this.config.runtime = runtime;
		
		return this;
	}
	
	workDir(workDir: string): ServiceProvider {
		this.config.workDir = workDir;
		
		return this;
	}
	
	needsEntrypoint(): boolean {
		return super.needsEntrypoint() || this.config.links.length > 0 || this.config.commands.length > 0;
	}
	
	// @ts-ignore
	get<K extends keyof IEnvServiceConfig>(field: K, env:Env): ResolvedEnvServiceConfig[K] {
		const envProvider = this.environments.get(env);
		const providerValue = this.config[field];
		const envValue = envProvider && envProvider.config[field]
		
		if(envValue) {
			if(this.merge.includes(field) && Array.isArray(providerValue)) {
				// @ts-ignore
				return providerValue.concat(envValue);
			}
			
			if(typeof envValue === 'function') {
				return [];
			} else if(Array.isArray(envValue)) {
				return envValue;
			}
		}
		
		if(typeof providerValue === 'function') {
			return [];
		} else if(Array.isArray(providerValue)) {
			return providerValue;
		}
	}
}
