import {iProject} from "../models/Project";
import {
  isRepoInfo,
  isServiceInstance,
  isServiceProvider,
  NormalizedComposeProvider
} from "../../../types";
import {NodeJSSource, ServiceFactory} from "../docker-services";
import {composer} from "./composer";

export function providerFromProject(project: iProject): NormalizedComposeProvider {
  return providerFromPath(`${project.root}/.dist/compose-provider.js`);
}

export function providerFromPath(path:string): any {
  const allExports = require(path);
  const defaultExport = allExports.default ? { ...allExports.default } : {
    version: '3.7'
  };

  const services = {};
  const processServiceDefinitions = (obj:Object) => {
    for(const [serviceName, serviceDef] of Object.entries(obj)) {
      console.log(serviceName, serviceDef);
      if(isServiceInstance(serviceDef) || isServiceProvider(serviceDef)) {
        services[serviceName] = serviceDef;

        if(isServiceProvider(serviceDef) && serviceDef.repo) {
          composer.addSource(serviceName, serviceDef.repo);
        }
      } else if(isRepoInfo(serviceDef)) {
        composer.addSource(serviceName, serviceDef);
      }
    }
  }

  if(defaultExport.services) {
    processServiceDefinitions(defaultExport.services);
  }

  processServiceDefinitions(allExports);
  for(const [serviceName, serviceDef] of Object.entries(services)) {
    if(isServiceProvider(serviceDef)) {
      services[serviceName] = new ServiceFactory(serviceDef);
    }

    services[serviceName].name = serviceName;
  }
  defaultExport.services = services;
  return defaultExport;
}
