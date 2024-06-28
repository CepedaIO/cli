import {ServiceProvider} from "../../models/ServiceProvider";

type VarDict = NodeJS.Dict<string | number | boolean>;

interface IEnvConfig {
  variables: VarDict;
  includes: ServiceProvider[];
  excludes: ServiceProvider[];
}

export class Env {
  config: IEnvConfig;
  
  constructor(
    public name: string,
    config: Partial<IEnvConfig> = {}
  ) {
    this.config = {
      variables: {},
      includes: [],
      excludes: [],
      ...config
    }
  }
  
  addVariables(variables: VarDict) {
    this.config.variables = Object.assign(this.config.variables, variables);
    return this;
  }
  
  include(...include:ServiceProvider[]): Env {
    this.config.includes = this.config.includes.concat(include);
    
    return this;
  }
  
  exclude(...exclude:ServiceProvider[]): Env {
    this.config.includes = this.config.includes.concat(exclude);
    
    return this;
  }
  
  extend(newName:string, config: Partial<IEnvConfig> = {}) {
    return new Env(newName, Object.assign(this.config, config));
  }
}
