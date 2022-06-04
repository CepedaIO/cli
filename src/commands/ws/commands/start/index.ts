import chalk from 'chalk';
import {run} from "@vlegm/utils";
import { generateStartFiles } from './generateStartFiles';
import {StartOptions} from "../../../../types";
import {serviceExists} from "../../services/serviceExists";
import {getProject} from "../../prompts/getProject";

export async function start(serviceName?:string, projectName?: string, options?: StartOptions) {
  options = options!;
  const project = await getProject(projectName, serviceName);

  options.env = 'local';

  await generateStartFiles(project, options);
/*
  if(serviceExists(serviceName, project)) {
    /**
     * service provided, restart for service
     *
    console.log(`Starting service: ${chalk.yellow(serviceName)}`);
    await run('docker-compose', ['up', '-d', serviceName], project.root);
  } else {
    /**
     * No service provided, start whole project
     *
    if(!options.generate) {
      console.log(`Starting project!`);
      await run('docker-compose', ['up', '-d', '--remove-orphans'], project.root);
    }
  }*/
}
