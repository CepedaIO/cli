import {iProject} from "../../models/Project";
import {definitionsForProject} from "./definitionsForProject";

export function providerNamesForProject(project:iProject): string[] {
  const { app: { providers } } = definitionsForProject(project);
  return providers.map((provider) => provider.name);
}
