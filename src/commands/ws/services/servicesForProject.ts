import {iProject} from "../models/Project";
import {providerFromProject} from "./providerFromProject";

export function servicesForProject(project:iProject): string[] {
  const provider = providerFromProject(project);

  return [
    ...Object.keys(provider.services || {})
  ];
}