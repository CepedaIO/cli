import {
  StartOptions,
  NormalizedComposeProvider
} from "../../../../types";
import {processServices} from "./processServices";
import {validateSchema} from "../../services/validateSchema";
import {readFile} from "fs/promises";
import {assetsDir} from "../../../../configs/app";
import {DockerCompose} from "../../../../docker-compose";
import chalk from "chalk";
import {processVolumes} from "./processVolumes";
import {JSAML} from "@vlegm/utils";
import {iProject} from "../../models/Project";

export async function createDockerCompose(project:iProject, config:NormalizedComposeProvider, options:StartOptions): Promise<DockerCompose> {
  const schemaBuffer = await readFile(`${assetsDir}/docker-compose.schema.json`);
  const schema = JSON.parse(schemaBuffer.toString('utf-8'));
  const compose = {
    ...config,
    services: await processServices(project, config, options),
    volumes: await processVolumes(config, options)
  };

  const result = validateSchema(compose, schema, {
    filterAdditionalProperties: true
  });

  if(result.errors.length > 0) {
    console.log(`Generated compose file ${chalk.redBright('invalid')}:`);
    console.log(result.errors);
  }

  return result.result as DockerCompose;
}

export async function generateDockerCompose(project:iProject, config:NormalizedComposeProvider, options:StartOptions): Promise<void>{
  const compose = await createDockerCompose(project, config, options);
  console.log(`Creating: ${chalk.greenBright('docker-compose.yaml')}`);
  await JSAML.save(compose, `${project.root}/docker-compose.yaml`);
}
