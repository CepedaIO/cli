import {Application} from "../models/Application";
import {Project} from "../models/Project";

export async function getProject(projectName?: string) {
  if(projectName) {
    return Project.get(projectName);
  }

  return Application.defaultProject();
}
