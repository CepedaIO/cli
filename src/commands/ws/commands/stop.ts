import {run} from "@vlegm/utils";
import {getProject} from "../services/getProject";
import {serviceExists} from "../services/serviceExists";

export async function stop(service?: string, projectName?: string) {
  const project = await getProject(projectName, service);

  if(serviceExists(service, project)) {
    /**
     * service provided, restart for service
     */
    console.log(`Stopping service: ${service}`);
    await run('docker-compose', ['stop', service!], project.root);
    await run('docker-compose', ['rm', service!], project.root);
  } else {
    /**
     * No service provided, stop whole project
     */
    console.log('Stopping project!');
    await run('docker-compose', ['down'], project.root);
  }
}
