import {iProject} from "../models/Project";
import {
  isRepoInfo,
  isServiceInstance,
  isServiceProvider,
  NormalizedComposeProvider
} from "../../../types";
import {Service} from "../docker-services";
import {composer} from "./composer";

export function providerFromProject(project: iProject): NormalizedComposeProvider {
  return providerFromPath(`${project.root}/.dist/compose-provider.js`);
}

export function providerFromPath(path:string): NormalizedComposeProvider {
  console.log(1)
  const allExports = require(path);
  const defaultExport = allExports.default ? { ...allExports.default } : {
    version: '3.7'
  };

  console.log(2);
  const services = {};
  const processServiceDefinitions = (obj:Object) => {
    for(const [serviceName, serviceDef] of Object.entries(obj)) {
      if(isServiceInstance(serviceDef) || isServiceProvider(serviceDef)) {
        services[serviceName] = serviceDef;
      } else if(isRepoInfo(serviceDef)) {
        composer.addSource(serviceName, serviceDef);
      }
    }
  }

  console.log(3)
  if(defaultExport.services) {
    processServiceDefinitions(defaultExport.services);
  }

  console.log(4)
  processServiceDefinitions(allExports);
  console.log(5)
  for(const [serviceName, serviceDef] of Object.entries(services)) {
    if(isServiceProvider(serviceDef)) {
      services[serviceName] = new Service(serviceDef);;
    }

    services[serviceName].name = serviceName;
  }
  console.log(6)
  defaultExport.services = services;
  return defaultExport;
}
