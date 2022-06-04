import chalk from 'chalk';
import {run} from "@vlegm/utils";
import { generateStartFiles } from './generateStartFiles';
import {getProject} from "../../services/getProject";
import {StartOptions} from "../../../../types";
import {serviceExists} from "../../services/serviceExists";

export async function start(service?:string, projectName?: string, options?: StartOptions) {
  const project = await getProject(projectName, service);
  const environment = "local";

  await generateStartFiles(project, environment, options!);

  if(serviceExists(service, project)) {
    /**
     * service provided, restart for service
     */
    console.log(`Starting service: ${chalk.yellow(service)}`);
    await run('docker-compose', ['up', '-d', service], project.root);
  } else {
    /**
     * No service provided, start whole project
     */
    if(!options || !options.generate) {
      console.log(`Starting project!`);
      await run('docker-compose', ['up', '-d', '--remove-orphans'], project.root);
    }
  }
}
