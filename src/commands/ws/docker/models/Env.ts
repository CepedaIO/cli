type VarDict = NodeJS.Dict<string | number | boolean>;

export class Env {
  constructor(
    private variables: VarDict
  ){ }
  
  addVariables(variables: VarDict) {
    this.variables = Object.assign(this.variables, variables);
    return this;
  }
  
  extend(variables: VarDict) {
    return new Env(Object.assign(this.variables, variables))
  }
}
