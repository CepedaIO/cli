import { JSAML } from "@vlegm/utils"
import {existsSync, mkdirSync} from "fs";

import { dataDir } from "../../../config/app";
import { Project } from "./Project";

export interface Application {
  defaults: {
    project?: string;
  }
}

function applicationURL() {
  return `${dataDir}/app.json`;
}

export const Application = {
  data: null as Application | null,

  async init() {
    if(!existsSync(applicationURL())) {
      return JSAML.save({
        defaults: {}
      }, applicationURL());
    }
  },

  async save(application: Application) {
    this.data = application;
    return JSAML.save(application, applicationURL());
  },

  async get(): Promise<Application> {
    if(this.data) return this.data;
    return JSAML.read(applicationURL());
  },

  async defaults(): Promise<Application['defaults']> {
    const app = await Application.get();
    return app.defaults;
  },

  async defaultProject(): Promise<Project | null> {
    const defaults = await Application.defaults();
    return defaults.project ? Project.get(defaults.project) : null; 
  }
}