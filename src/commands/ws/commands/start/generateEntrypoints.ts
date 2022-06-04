import {
  NormalizedComposeProvider,
  ProviderContext,
  StartOptions
} from "../../../../types";
import {normalize} from "path";
import {chmod, writeFile} from "fs/promises";
import {isBaseService} from "../../docker-services";
import {distDir} from "../../../../config/app";
import {iProject} from "../../models/Project";

export async function generateEntrypoint(project:iProject, provider: NormalizedComposeProvider, options: StartOptions) {
  for(const [serviceName, serviceDef] of Object.entries(provider.services)) {
    if(!serviceDef) {
      break;
    }

    const context:ProviderContext = {
      name: serviceName,
      options
    };

    if(isBaseService(serviceDef) && serviceDef.needsEntrypoint(context)) {
      const lines = await serviceDef.entrypointLines(project, context);
      const entrypointName = `${context.name}-entrypoint.sh`;
      const entrypointPath = normalize(`${distDir(project.root)}/${entrypointName}`);
      await writeFile(entrypointPath, lines.join('\n'));
      await chmod(entrypointPath, "755");
    }
  }
}
