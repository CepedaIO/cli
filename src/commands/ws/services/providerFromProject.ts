import {iProject} from "../models/Project";
import {isServiceInstance, isServiceProvider, NormalizedComposeProvider} from "../../../types";
import {Service} from "../docker-services";

export function providerFromProject(project: iProject): NormalizedComposeProvider {
  const allExports = require(`${project.root}/.dist/compose-provider.js`);
  const defaultExport = allExports.default ? { ...allExports.default } : {
    version: '3.7'
  };

  if(!defaultExport.services) {
    defaultExport.services = {};
  }

  for(const [serviceName, serviceDef] of Object.entries(allExports)) {
    if(serviceName !== 'default') {
      if(isServiceInstance(serviceDef) || isServiceProvider(serviceDef)) {
        defaultExport.services[serviceName] = serviceDef;
      }
    }
  }

  for(const [serviceName, serviceDef] of Object.entries(defaultExport.services)) {
    if(isServiceProvider(serviceDef)) {
      defaultExport.services[serviceName] = new Service(serviceDef);
    }
  }

  return defaultExport;
}