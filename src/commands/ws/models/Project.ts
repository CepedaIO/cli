import {dataDir} from "../../../configs/app";
import { promises, existsSync } from "fs";
import {normalize} from "path";
import {JSAML} from "@vlegm/utils";
import {getRoot} from "../services/getRoot";

const { readdir, mkdir, rm } = promises;

export interface iProject {
  name: string;
  hash?: string;
  root: string;
  sources: {
    initialized: string[];
  }
  services: {
    root: string;
    excluded: string[];
  }
}

function dataURL(name:string) {
  return `${dataDir}/${name}`;
}
function projectURL(name:string) {
  return `${dataURL(name)}/project.json`;
}

export const Project = {
  async init(name: string, _root?: string) {
    const root = normalize(_root ? _root : getRoot(name));
    const servicesRoot = normalize(`${root}/services`);
    const project = {
      name,
      root,
      sources: {
        initialized: []
      },
      services: {
        root: servicesRoot,
        excluded: []
      }
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
