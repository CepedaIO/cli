import {
	RepoInfo,
	Tuple
} from "../../../types";
import {Env} from "../docker";
import {Context} from "../ws-types";
import {CommandManager} from "../docker/models/CommandManager";

type ICommandManager = {
	run: (command:string) => string;
}

type CommandFunctionArgs = (params: {
	manager: ICommandManager
}) => string[]

type CommandFunction = ({})

export function isProviderFactory(obj:any): obj is ServiceProvider {
	return !!obj.provider && !!obj.base && !!obj.defaults && typeof obj.npmLink === 'function';
}

export interface IServiceResolver {
	getServiceConfig(context: Context): IServiceConfig;
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
                manager: {
                    run: (command:string) => {
                        return `npm run ${command}`;
                    }
                }
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

const configKeys = [
    'runtime',
    'includes',
    'ports',
    'links',
    'mounts',
    'inits',
    'commands'
];

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

	getServiceConfig(context: Context): IServiceConfig {
		const env = context.env;

        if(!this.environments.has(env)) {
			throw new Error(`No environment configured for: ${env.name}`);
		}
		const envConfig = this.environments.get(env)!;
		const globalConfig = this.config;
        const manager = CommandManager.createFor(context.project.root);
		return configKeys.reduce((result, key) => {
            let value = envConfig.config[key];

			if(typeof value === 'function') {
                value = value({ manager, service: this });
            }

            //@ts-ignore
            if(this.merge.includes(key)) {
				result[key] = (value || []).concat(this.config[key] || this.defaults[key] || []);
			} else {
				result[key] = value || this.config[key] || this.defaults[key];
			}

            if(typeof result[key] === "function") {
                result[key] = result[key]({ manager });
            }

            if(Array.isArray(result[key]) && !result[key].length && typeof this.defaults[key] === 'function') {
                result[key] = this.defaults[key]({ manager });
            }

			return result;
		}, {} as IServiceConfig);
	}

	env(env: Env, configure: (params:{ service: EnvServiceProvider }) => void): ServiceProvider {
		const service = new EnvServiceProvider();
		configure({service});
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

	get<K extends keyof IEnvServiceConfig>(field: K, env:Env): ResolvedEnvServiceConfig[K] {
		const envProvider = this.environments.get(env);
		let providerValue = this.config[field];
		const envValue = envProvider && envProvider.config[field]
		let defaultValue = this.defaults[field];

		if(envValue) {
			if(this.merge.includes(field) && Array.isArray(providerValue) && providerValue.length > 0) {
				return (providerValue as any[]).concat(envValue);
			}

			if(typeof envValue === 'function') {
				return [] as any[];
			} else if(Array.isArray(envValue) && envValue.length > 0) {
				return envValue as any[];
			}
		}

		if(typeof providerValue === 'function') {
			return providerValue({
                manager: {
                    run: (command: string) => {
                        return `npm run ${command}`;
                    }
                }
            }) as ResolvedEnvServiceConfig[K];
		}

        if((!providerValue || (Array.isArray(providerValue) && providerValue.length === 0)) && typeof defaultValue === 'function') {
            return defaultValue({
                manager: {
                    run: (command:string) => {
                        return `npm run ${command}`;
                    }
                }
            }) as ResolvedEnvServiceConfig[K];
        }

        //@ts-ignore
        return providerValue || defaultValue;
    }

    static is(obj:any): obj is ServiceProvider {
        return obj.hasOwnProperty('name') && obj.hasOwnProperty('environments') && obj.hasOwnProperty('defaults') && obj.hasOwnProperty('config') && obj.hasOwnProperty('merge');
    }
}
