import {servicesForProject} from "./servicesForProject";
import {iProject} from "../models/Project";

export function serviceExists(service:string | undefined, project:iProject): service is string{
  if(!service) {
    return false;
  }

  const services = servicesForProject(project);
  return services.includes(service);
}