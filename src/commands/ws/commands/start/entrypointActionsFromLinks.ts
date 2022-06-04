import {iProject} from "../../models/Project";
import {DockerService, ServiceProvider} from "../../../../types";
import {tuple} from "./tuple";

export async function entrypointActionsFromLinks(project:iProject, provider: ServiceProvider, service: DockerService): Promise<string[]> {
  if(!provider.mnts) {
    return [];
  }

  const npmLinks = provider.mnts.filter((link) => {
    const [,linkName] = tuple(link);
    return !!linkName;
  })

  let actions = [
    'cwd=$PWD'
  ];

  actions = actions.concat(npmLinks.map((link) => {
    const [serviceName] = tuple(link);
    return `cd /mnt/${serviceName} && yarn link`;
  }));

  actions.push(`cd $cwd`);

  actions = actions.concat(npmLinks.map((link) => {
    const [,linkName] = tuple(link);
    return `yarn link ${linkName}`;
  }));

  return actions;
}
