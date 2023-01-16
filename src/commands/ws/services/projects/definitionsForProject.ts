import {iProject} from "../../models/Project";
import {Composer} from "../composer";
import {ServiceProvider} from "../../models/ServiceProvider";
import {Env} from "../../docker";
import {isRepoInfo, RepoInfo} from "../../../../types";

export interface AppDefinition {
  providers: ServiceProvider[];
  environments: Env[];
  repos: RepoInfo[]
}

export function definitionsForProject(project: iProject): {
  app: AppDefinition;
  composer: Composer
} {
  const composer = new Composer();
  const path = `${project.root}/.dist/app-provider.js`;
  const allExports = require(path);
  const app:AppDefinition = {
    providers: [],
    environments: [],
    repos: []
  };
  
  for(const [exportName, exported] of Object.entries(allExports)) {
    if (exported instanceof ServiceProvider) {
      exported.name = exportName;
      app.providers.push(exported);
      
      if(exported.config.source) {
        composer.addSource(exported.name, exported.config.source);
      }
    }
    
    if (exported instanceof Env) {
      exported.name = exportName;
      app.environments.push(exported);
    }
    
    if (isRepoInfo(exported)) {
      app.repos.push(exported);
    }
  }
  
  return {
    app: app,
    composer
  };
}
