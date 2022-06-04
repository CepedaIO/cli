import {run} from "@vlegm/utils";
import {getProject} from "../services/getProject";

export async function stop(service?: string, projectName?: string) {
  const project = await getProject(projectName, service);

  if(!service || project.name === service) {
    /**
     * No service provided, stop whole project
     */
    console.log('Stopping project!');
    await run('docker-compose', ['down'], project.root);
  } else if(service) {
    /**
     * service provided, restart for service
     */
    console.log(`Stopping service: ${service}`);
    await run('docker-compose', ['stop', service], project.root);
    await run('docker-compose', ['rm', service], project.root);
  }
}
