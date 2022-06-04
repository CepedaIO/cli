import {run} from "@vlegm/utils";
import {serviceExists} from "../services/serviceExists";
import {getProject} from "../prompts/getProject";

export async function tail(serviceName:string, projectName?:string) {
  const project = await getProject(projectName);

  if(!serviceExists(serviceName, project)) {
    throw new Error(`Service ${serviceName} is not part of project`);
  }

  await run('docker-compose', ['logs', '-ft', serviceName], project.root);
}
