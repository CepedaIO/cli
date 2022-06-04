import {getProject} from "../services/getProject";
import {run} from "@vlegm/utils";

export async function restart(service?:string, projectName?: string) {
  const project = await getProject(projectName, service);

  if(!service || project.name === service) {
    /**
     * No service provided, restart whole project
     */
    await run('docker-compose', ['down'], project.root);
    await run('docker-compose', ['up', '-d', '--remove-orphans'], project.root);
  } else if(service) {
    /**
     * service provided, restart for service
     */
    await run('docker-compose', ['rm', '-fs', service], project.root);
    await run('docker-compose', ['up', '-d', service], project.root);
  }
}