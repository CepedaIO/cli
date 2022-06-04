import {run} from "@vlegm/utils";
import {serviceExists} from "../services/serviceExists";
import {getProject} from "../prompts/getProject";

export async function restart(serviceName?:string, projectName?: string) {
  const project = await getProject(projectName, serviceName);

  if(serviceExists(serviceName, project)) {
    /**
     * service provided, restart for service
     */
    await run('docker-compose', ['rm', '-fs', serviceName], project.root);
    await run('docker-compose', ['up', '-d', serviceName], project.root);
  } else {
    /**
     * No service provided, restart whole project
     */
    await run('docker-compose', ['down'], project.root);
    await run('docker-compose', ['up', '-d', '--remove-orphans'], project.root);
  }
}