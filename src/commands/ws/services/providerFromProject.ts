import {iProject} from "../models/Project";
import {
  Dict, iServiceResolver,
  isRepoInfo,
  isServiceFactory,
  isServiceProvider,
  NormalizedComposeProvider, ServiceProvider
} from "../../../types";
import {composer} from "./composer";
import {isProviderFactory, ProviderFactory} from "../models/ProviderFactory";
import merge from "lodash.merge";
import {ServiceResolver} from "../models/ServiceResolver";

export function providerFromProject(project: iProject): NormalizedComposeProvider {
  return providerFromPath(`${project.root}/.dist/compose-provider.js`);
}

function serviceProviderFromFactory(factory: ProviderFactory): ServiceProvider {
  return merge(factory.base, factory.provider);
}

export function providerFromPath(path:string): any {
  const allExports = require(path);
  const defaultExport = allExports.default ? { ...allExports.default } : {
    version: '3.7'
  };

  const services:Dict<iServiceResolver> = {};

  const processServiceDefinitions = (obj:Object) => {
    for(const [serviceName, serviceDef] of Object.entries(obj)) {
      if(isProviderFactory(serviceDef)) {
        const provider = serviceProviderFromFactory(serviceDef);
        services[serviceName] = new ServiceResolver(provider, serviceDef.defaults);
      } else if(isServiceProvider(serviceDef)) {
        services[serviceName] = new ServiceResolver(serviceDef);
      } else if(isServiceFactory(serviceDef)) {
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
    if(serviceDef) {
      serviceDef.name = serviceName;

      if(serviceDef.source) {
        composer.addSource(serviceName, serviceDef.source);
      }
    }
  }

  defaultExport.services = services;
  return defaultExport;
}
