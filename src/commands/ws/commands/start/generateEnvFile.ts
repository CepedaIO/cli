import {NormalizedComposeProvider, ProviderContext, StartOptions} from "../../../../types";
import chalk from "chalk";
import {writeFile} from "fs/promises";
import {iProject} from "../../models/Project";

function generateEnvLines(provider:NormalizedComposeProvider, options:StartOptions): string[] {
  let lines:string[] = [];

  for(const [serviceName, serviceDef] of Object.entries(provider.services || {})) {
    if(serviceDef && serviceDef.env) {
      const context:ProviderContext = {
        name: serviceName,
        options
      }

      const env = typeof serviceDef.env === "function" ? serviceDef.env(context) : serviceDef.env;
      lines = lines.concat(
        Object.entries(env)
          .map(([flag, value]) => `${flag}=${value}`)
      )
    }
  }

  return lines;
}

export async function generateEnv(project:iProject, provider:NormalizedComposeProvider, options:StartOptions): Promise<boolean> {
  const lines = generateEnvLines(provider, options);

  if(lines.length > 0) {
    console.log(`Creating: ${chalk.greenBright('.env')}`);
    await writeFile(`${project.root}/.dist/.env`, lines.join('\n'), 'utf-8');
  }

  return lines.length > 0;
}