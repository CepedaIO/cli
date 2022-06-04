import chalk from 'chalk';
import {run} from "@vlegm/utils";
import { generateStartFiles } from './generateStartFiles';
import {getProject} from "../../services/getProject";
import {StartOptions} from "../../../../types";

export async function start(service?:string, projectName?: string, options?: StartOptions) {
  const project = await getProject(projectName, service);
  const environment = "local";

  if(!service || project.name === service) {
    /**
     * No service provided, start whole project
     */
    await generateStartFiles(project, environment, options!);

    if(!options || !options.generate) {
      console.log(`Starting project!`);
      await run('docker-compose', ['up', '-d', '--remove-orphans'], project.root);
    }
  } else if(service) {
    /**
     * service provided, restart for service
     */
    console.log(`Starting service: ${chalk.yellow(service)}`);
    await run('docker-compose', ['up', '-d', service], project.root);
  }
}
