import {ServiceProvider} from "../../models/ServiceProvider";
import {DockerCompose, DockerService} from "../../../../docker-compose";
import {Project} from "../../models/Project";
import path, {join, normalize} from "path";
import {existsSync} from "fs";
import {chmod, readFile, writeFile} from "fs/promises";
import {assetsDir, distDir} from "../../../../configs/app";
import {validateSchema} from "../validateSchema";
import chalk from "chalk";
import {JSAML} from "../../../../../../utils";
import {Context} from "../../ws-types";

export class DockerResolver {
  async generate(providers: ServiceProvider[], context: Context) {
    const compose = await this.create(providers, context);
    const validatedCompose = await this.validate(compose);
    await this.write(validatedCompose, providers, context);
  }

  async write(compose: DockerCompose, providers:ServiceProvider[], context: Context): Promise<void> {
    console.log(`Writing: ${chalk.                                                                    greenBright('docker-compose.yaml')}`)
    await JSAML.save(compose, `${context.project.root}/docker-compose.yaml`);
    
    for(const provider of providers) {
      if(provider.needsEntrypoint()) {
        await this.writeEntrypoint(provider, context);
      }
    }
  }
  
  async validate(compose: DockerCompose): Promise<DockerCompose> {
    console.log(`Validating: ${chalk.greenBright('docker-compose.yaml')}`);
    const schemaBuffer = await readFile(`${assetsDir}/docker-compose.schema.json`);
    const schema = JSON.parse(schemaBuffer.toString('utf-8'));
    const validation = validateSchema(compose, schema, {
      filterAdditionalProperties: true
    });
  
    if(validation.errors.length > 0) {
      console.log(`Generated compose file ${chalk.redBright('invalid')}:`);
      console.log(validation.errors);
    }
    
    return validation.result;
  }
  
  async create(providers: ServiceProvider[], context: Context): Promise<DockerCompose> {
    console.log(`Creating: ${chalk.greenBright('docker-compose.yaml')}`);
    
    const services = providers.reduce((services, provider) => ({
      [provider.name]: this.serviceDefinitionFrom(provider, context)
    }), {});
    
    return {
      version: '3.7',
      services
    };
  }
  
  async writeEntrypoint(provider: ServiceProvider, context: Context) {
    const lines = await this.entrypointLines(provider, context);
    const entrypointName = `${provider.name}-entrypoint.sh`;
    const entrypointPath = normalize(`${distDir(context.project.root)}/${entrypointName}`);
    await writeFile(entrypointPath, lines.join('\n'));
    await chmod(entrypointPath, "755");
  }
  
  async entrypointLines(provider: ServiceProvider, context: Context): Promise<string[]> {
    let actions: string[] = [];
    const commands = provider.get('commands', context.env);
    const links = provider.get('links', context.env);
    const info = await context.linkProvider.getLinkInfo(provider, context);
    
    if(links.length > 0) {
      actions.push('cwd=$PWD')
  
      actions = actions.concat(links.map((linkServiceProvider) => {
        return `cd /mnt/${linkServiceProvider.name} && ${info.manager} link`;
      }));
  
      actions.push(`cd $cwd`);
  
      actions = actions.concat(links.map((linkServiceProvider) => {
        return `${info.manager} link ${info.nameMap[linkServiceProvider.name]}`;
      }));
    }
    
    if(Array.isArray(commands) && commands.length > 0) {
      actions = actions.concat(commands);
    }
    
    if(actions.length > 0) {
      actions.unshift('#!/usr/bin/env sh');
    }
    
    return actions;
  }
  
  workDirFor(provider: ServiceProvider): string {
    return provider.config.workDir || `/mnt/${provider.name}`;
  }

  volumesFor(provider: ServiceProvider, context: Context): Partial<DockerService> {
    const volumes: string[] = [];
    const includes = provider.get('includes', context.env);
    const mounts = provider.get('mounts', context.env);
    const links = provider.get('links', context.env);
    const workDir = this.workDirFor(provider);
    const servicePath = path.join('./services', provider.name);
  
    if(includes.length === 0) {
      volumes.push(`${servicePath}:${workDir}`);
    } else {
      includes.forEach((dir) => {
        const dirPath = path.join(workDir, dir);
        const serviceDirPath = path.join(servicePath, dir);
        volumes.push(`${serviceDirPath}:${dirPath}`);
      });
    }
    
    mounts.concat(links).forEach((mountProvider) => {
      const mountDir = `./services/${mountProvider.name}`;
      volumes.push(`${mountDir}:/mnt/${mountProvider.name}`);
    });
  
    const definition: Partial<DockerService> = {
      volumes
    };
    
    if(provider.needsEntrypoint()) {
      const entrypointName = `${provider.name}-entrypoint.sh`;
      const entrypointPath = `./.dist/${entrypointName}`;
      volumes.push(`${entrypointPath}:/mnt/entrypoint.sh`);
      
      definition.entrypoint = '/mnt/entrypoint.sh';
    }
    
    return definition;
  }
  
  serviceDefinitionFrom(provider: ServiceProvider, context:Context): DockerService {
    const runtime = this.runtimeFor(provider, context);
    const volumes = this.volumesFor(provider, context);
    
    if(!runtime) throw new Error(`No runtime provided for: ${provider.name}`);
    
    return {
      ...runtime,
      ...volumes,
      command: provider.get('commands', context.env),
      working_dir: this.workDirFor(provider)
    }
  }
  
  runtimeFor(provider:ServiceProvider, context: Context): Partial<DockerService> {
    if(provider.config.runtime) {
      return {
        image: provider.config.runtime
      };
    }
    
    const servicePath = Project.pathFor(context.project, provider.name);
    const dockerfilePath = join(servicePath, 'Dockerfile');
    
    if(existsSync(dockerfilePath)) {
      return {
        build: `./services/${provider.name}`
      };
    }
    
    throw new Error(`No runtime defined for: ${provider.name}`);
  }
}
