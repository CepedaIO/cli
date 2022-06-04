import {dataDir} from "../../../config/app";
import { promises, existsSync } from "fs";
import {normalize} from "path";
import {JSAML} from "@vlegm/utils";
import {getRoot} from "../services/getRoot";

const { readdir, mkdir, rm } = promises;

export interface iProject {
  name: string;
  root: string;
  servicesRoot: string;
  hash?: string;
  workstation?: string;
}

function dataURL(name:string) {
  return `${dataDir}/${name}`;
}
function projectURL(name:string) {
  return `${dataURL(name)}/project.json`;
}

export function getServiceRoot(project:iProject, serviceName: string) {
  return `${project.servicesRoot}/${serviceName}`;
}

export const Project = {
  async init(name: string, _root?: string) {
    const root = normalize(_root ? _root : getRoot(name));
    const servicesRoot = normalize(`${root}/services`);
    const project = {
      name,
      root,
      servicesRoot
    }

    await Project.save(project);
    return project;
  },

  async save(project: iProject) {
    if(!existsSync(dataURL(project.name))) {
      await mkdir(dataURL(project.name));
    }

    return JSAML.save(project, projectURL(project.name))
  },

  async get(name?: string): Promise<iProject | undefined> {
    if(!name) {
      return;
    }

    try {
      return await JSAML.read(projectURL(name))
    } catch {}
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
