import {Dict, Linkable, ServiceProvider, ServiceProviderDefaults, ShellCommand, Tuple} from "../../../types";
import {merge} from "node-json-db/dist/lib/Utils";
import {Env} from "../docker";

export function isProviderFactory(obj:any): obj is ProviderFactory {
	return !!obj.provider && !!obj.base && !!obj.defaults && typeof obj.npmLink === 'function';
}

export type EnvConfiguration = (service: ServiceConfiguration) => void;

export class ServiceConfiguration {
	private links: Linkable[] = [];
	private mounts: string[] = [];
	private commands: string[] = [];
	private ports: Tuple<number>[] = [];
	public then = this;

	link(...services: Linkable[]): ServiceConfiguration {
		this.links = this.links.concat(services);
		return this;
	}
	
	mount(...dirs: string[]): ServiceConfiguration {
		this.mounts = this.mounts.concat(dirs);
		return this;
	}
	
	run(...commands: string[]): ServiceConfiguration {
		this.commands = this.commands.concat(commands);
		return this;
	}
	
	port(...ports: Array<number | Tuple<number>>): ServiceConfiguration {
		ports.forEach((port) => {
			if(Array.isArray(port)) {
				this.ports = this.ports.concat(port);
			} else {
				this.ports = this.ports.concat([port, port]);
			}
		});
		
		return this;
	}
}

export class ProviderFactory {
	public provider:ServiceProvider = {};
	public environments: Map<Env, ServiceConfiguration> = new Map();

	constructor(
		public base:ServiceProvider = {},
		public defaults: ServiceProviderDefaults = {}
	) {
		merge()
	}

	image(image: ServiceProvider['image']): ProviderFactory {
		this.provider.image = image;
		return this;
	}

	include(...include:string[]): ProviderFactory {
		if(!this.provider.include) {
			this.provider.include = [];
		}

		this.provider.include = this.provider.include.concat(include);
		return this;
	}

	npmLink(...services: string[]): ProviderFactory {
		if(!this.provider.npmLinks) {
			this.provider.npmLinks = [];
		}

		this.provider.npmLinks = this.provider.npmLinks.concat(services);
		return this;
	}

	command(command: ShellCommand): ProviderFactory {
		this.provider.command = command;
		return this;
	}

	source(url: string, init?: ShellCommand): ProviderFactory {
		if(!init && this.defaults.repo?.init) {
			init = this.defaults.repo.init;
		}

		this.provider.repo = { url, init };
		return this;
	}

	env(env: Env, configure: (service: ServiceConfiguration) => void): ProviderFactory {
		const service = new ServiceConfiguration();
		configure(service);
		this.environments.set(env, service);
		
		return this;
	}

	addPort(port:number | number[]) {
		const doAddPort = (port: number) => {

		}
	}
}
