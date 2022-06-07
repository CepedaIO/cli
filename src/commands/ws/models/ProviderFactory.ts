import {Dict, ServiceProvider, ServiceProviderDefaults, ShellCommand} from "../../../types";

export function isProviderFactory(obj:any): obj is ProviderFactory {
	return !!obj.provider && !!obj.base && !!obj.defaults && typeof obj.npmLink === 'function';
}

export class ProviderFactory {
	public provider:ServiceProvider = {};

	constructor(
		public base:ServiceProvider = {},
		public defaults: ServiceProviderDefaults = {}
	) {}

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

	env(values:Dict<string | number>): ProviderFactory {
		if(!this.provider.env) {
			this.provider.env = {};
		}

		this.provider.env = {
			...this.provider.env,
			...values
		};
		return this;
	}
}