import {getProject} from "../services/getProject";
import {run} from "@vlegm/utils";
import {serviceExists} from "../services/serviceExists";

export async function restart(service?:string, projectName?: string) {
  const project = await getProject(projectName, service);

  if(serviceExists(service, project)) {
    /**
     * service provided, restart for service
     */
    await run('docker-compose', ['rm', '-fs', service], project.root);
    await run('docker-compose', ['up', '-d', service], project.root);
  } else {
    /**
     * No service provided, restart whole project
     */
    await run('docker-compose', ['down'], project.root);
    await run('docker-compose', ['up', '-d', '--remove-orphans'], project.root);
  }
}