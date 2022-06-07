import {ProviderFactory} from "../models/ProviderFactory";
import {DockerService} from "../../../docker-compose";
import {ProviderContext} from "../../../types";

export function NodeJS(port: number): ProviderFactory {
  return new ProviderFactory({
    ports: [
      `${port}:${port}`
    ]
  }, {
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