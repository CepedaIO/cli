import {ProviderFactory} from "../models/ProviderFactory";
import {DockerService} from "../../../docker-compose";
import {ProviderContext} from "../../../types";

export function NodeJS(expose: number | number[]): ProviderFactory {
  const toPortDefinition = (port:number) => `${port}:${port}`;
  const ports = !Array.isArray(expose) ? [toPortDefinition(expose)] : expose.map(toPortDefinition);

  return new ProviderFactory({ ports }, {
    runtime(context: ProviderContext): Pick<DockerService, "image" | "build" | "command"> {
      return {
        image: 'node:16-alpine',
        command: [
          'yarn install',
          'yarn dev'
        ]
      }
    }
  });
}
