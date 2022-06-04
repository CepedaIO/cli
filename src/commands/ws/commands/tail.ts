import {run} from "@vlegm/utils";
import {serviceExists} from "../services/serviceExists";
import {getProject} from "../prompts/getProject";

interface StartOptions {
  peek: boolean
}

export async function tail(serviceName:string, projectName?:string, options?:StartOptions) {
  const project = await getProject(projectName);

  if(!serviceExists(serviceName, project)) {
    throw new Error(`Service ${serviceName} is not part of project`);
  }

  const flags:string[] = [];

  if(options?.peek !== true) {
    flags.push('-f')
  }

  await run('docker-compose', ['logs', ...flags, serviceName], project.root);
}
