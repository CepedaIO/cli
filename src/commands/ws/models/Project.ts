import {dataDir} from "../../../config/app";
import { promises, existsSync } from "fs";
import {JSAML} from "@vlegm/utils";
import {getRoot} from "../services/getRoot";

const { readdir, mkdir, rm } = promises;

export interface Project {
  name: string;
  root: string;
  hash?: string;
  workstation?: string;
}

function dataURL(name:string) {
  return `${dataDir}/${name}`;
}
function projectURL(name:string) {
  return `${dataURL(name)}/project.json`;
}

export const Project = {
  async init(name: string, root?: string) {
    const project = {
      name,
      root: root ? root : getRoot(name)
    }

    await Project.save(project);
    return project;
  },

  async save(project: Project) {
    if(!existsSync(dataURL(project.name))) {
      await mkdir(dataURL(project.name));
    }

    return JSAML.save(project, projectURL(project.name))
  },

  async get(name: string): Promise<Project> {
    return JSAML.read(projectURL(name)) as Promise<Project>
  },

  has(name: string) {
    return existsSync(projectURL(name));
  },

  async names(): Promise<string[]> {
    const files = await readdir(dataDir, { withFileTypes: true });
    return files
      .filter((file) => file.isDirectory())
      .map((file) => file.name);
  },

  async remove(name: string) {
    return rm(dataURL(name), { recursive: true });
  }
}