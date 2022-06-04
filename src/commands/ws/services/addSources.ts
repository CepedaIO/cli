import {NormalizedComposeProvider} from "../../../types";
import {Composer} from "./composer";

export function addSources(composer:Composer, provider: NormalizedComposeProvider) {
  Object.entries(provider.services)
    .forEach(([serviceName, service]) => {
      if(!service) {
        return;
      }

      if(service.source) {
        composer.addSource(serviceName, service.source);
      }
    });
}
