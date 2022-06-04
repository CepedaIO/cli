import {run} from "@vlegm/utils";
import {serviceExists} from "../services/serviceExists";
import {getProject} from "../prompts/getProject";

export async function stop(serviceName?: string, projectName?: string) {
  const project = await getProject(projectName, serviceName);

  if(serviceExists(serviceName, project)) {
    /**
     * service provided, restart for service
     */
    console.log(`Stopping service: ${serviceName}`);
    await run('docker-compose', ['stop', serviceName], project.root);
    await run('docker-compose', ['rm', serviceName], project.root);
  } else {
    /**
     * No service provided, stop whole project
     */
    console.log('Stopping project!');
    await run('docker-compose', ['down'], project.root);
  }
}
