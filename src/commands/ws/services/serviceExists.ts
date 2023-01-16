import {providerNamesForProject} from "./projects/providerNamesForProject";
import {iProject} from "../models/Project";

export function serviceExists(service:string | undefined, project:iProject): service is string{
  if(!service) {
    return false;
  }

  const services =  providerNamesForProject(project);
  return services.includes(service);
}
