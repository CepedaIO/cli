import inquirer from 'inquirer';
import {iProject, Project} from "../models/Project";
import {Application} from "../models/Application";

export async function getProject(projectName?: string, serviceName?: string): Promise<iProject> {
  const projectNames = await Project.names();

  if(projectNames.length === 0) {
    throw new Error(`No projects setup!`);
  }

  if(projectName) {
    if(!Project.has(projectName)) {
      throw new Error(`No project named: ${projectName}`);
    }

    return Project.get(projectName) as Promise<iProject>;
  }

  if(serviceName && Project.has(serviceName)) {
    return Project.get(serviceName) as Promise<iProject>;
  }


  if(projectNames.length === 1) {
    return Project.get(projectNames[0]) as Promise<iProject>;
  }

  const { project } = await inquirer.prompt([
    {
      type: 'list',
      name: 'project',
      message: 'Which project are running this command for?:',
      choices: await Project.names(),
      default: (await Application.defaultProject() || {}).name
    }
  ]);

  return Project.get(project) as Promise<iProject>;
}
