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
  const allExports = require(`${project.root}/.dist/compose-provider.js`);
  const defaultExport = allExports.default ? { ...allExports.default } : {
    version: '3.7'
  };

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

  if(defaultExport.services) {
    processServiceDefinitions(defaultExport.services);
  }

  processServiceDefinitions(allExports);

  for(const [serviceName, serviceDef] of Object.entries(services)) {
    if(isServiceProvider(serviceDef)) {
      services[serviceName] = new Service(serviceDef);;
    }

    services[serviceName].name = serviceName;
  }

  defaultExport.services = services;
  return defaultExport;
}
