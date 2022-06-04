import {NormalizedComposeProvider} from "../../../types";
import {BaseService} from "../docker-services";
import {Composer} from "./composer";

export function addSources(composer:Composer, provider: NormalizedComposeProvider) {
  Object.entries(provider.services)
    .forEach(([serviceName, service]) => {
      if(service instanceof BaseService) {
        service.sources.forEach((source) => composer.addSource(serviceName, source));
      }
    });
}