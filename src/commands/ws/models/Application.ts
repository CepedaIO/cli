import { JSAML } from "@cepedaio/utils"
import {existsSync} from "fs";

import { dataDir } from "../../../configs/app";
import { iProject, Project } from "./Project";

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

  async defaultProject(): Promise<iProject | undefined> {
    const defaults = await Application.defaults();
    return defaults.project ? Project.get(defaults.project) : undefined;
  },

  async removeDefaultProject(): Promise<void> {
    const app = await Application.get();
    if(app.defaults && app.defaults.project) {
      delete app.defaults.project
    }
    await Application.save(app);
  }
}
