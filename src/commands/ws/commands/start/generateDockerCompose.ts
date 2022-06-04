import {
  StartOptions,
  NormalizedComposeProvider
} from "../../../../types";
import {processServices} from "./processServices";
import {validateSchema} from "../../services/validateSchema";
import {readFile} from "fs/promises";
import {assetsDir} from "../../../../config/app";
import {DockerCompose} from "../../../../docker-compose";
import chalk from "chalk";
import {processVolumes} from "./processVolumes";
import {JSAML} from "@vlegm/utils";

export async function createDockerCompose(config:NormalizedComposeProvider, options:StartOptions): Promise<DockerCompose> {
  const schemaBuffer = await readFile(`${assetsDir}/docker-compose.schema.json`);
  const schema = JSON.parse(schemaBuffer.toString('utf-8'));
  const compose = {
    ...config,
    services: await processServices(config, options),
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

export async function generateDockerCompose(config:NormalizedComposeProvider, options:StartOptions): Promise<void>{
  const compose = await createDockerCompose(config, options);
  console.log(`Creating: ${chalk.greenBright('docker-compose.yaml')}`);
  await JSAML.save(compose, `${options.root}/docker-compose.yaml`);
}