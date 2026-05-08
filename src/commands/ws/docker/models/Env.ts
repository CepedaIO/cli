import {ServiceProvider} from "../../models/ServiceProvider";

type VarDict = NodeJS.Dict<string | number | boolean>;

interface IEnvConfig {
  variables: VarDict;
  includes: ServiceProvider[];
  excludes: ServiceProvider[];
}

export class Env {
  public name: string;
  config: IEnvConfig;
  
  constructor(
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
    return new Env(Object.assign(this.config, config));
  }

  static is(obj:any): obj is Env {
      return obj.hasOwnProperty('name') && obj.hasOwnProperty('config') && obj.config.hasOwnProperty('excludes') && obj.config.hasOwnProperty('includes') && obj.config.hasOwnProperty('variables');
  }
}
