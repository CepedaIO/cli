import {ServiceProvider} from "../../models/ServiceProvider";
import {existsSync} from "fs";
import {readFile} from "fs/promises";
import {Context} from "../../ws-types";

export class NodeResolver {
  async getLinkInfo(provider: ServiceProvider, context: Context) {
    let manager;
    const project = context.project;
    
    if(existsSync(`${project.services.root}/${provider.name}/package-lock.json`)) {
      manager = 'npm';
    } else if(existsSync(`${project.services.root}/${provider.name}/yarn.lock`)) {
      manager = 'yarn';
    } else {
      throw new Error(`Unable to determine package manager for (${provider.name})`);
    }
    
    const nameMap = {};
    
    for(const linkServiceProvider of provider.config.links) {
      const path = `${project.services.root}/${linkServiceProvider.name}/package.json`;
      
      if(!existsSync(path)) {
        continue;
      }
      
      const packageData = await readFile(path, 'utf-8');
      const packageJSON = JSON.parse(packageData);
      
      nameMap[linkServiceProvider.name] = packageJSON.name;
    }
    
    return {
      manager, nameMap
    };
  }
}
