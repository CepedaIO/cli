import {Application} from "../models/Application";
import {Project} from "../models/Project";

export async function getProject(projectName?: string) {
  if(!projectName) {
    return await Application.defaultProject();
  }

  return await Project.get(projectName);
}