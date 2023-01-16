import {IServiceConfig, ServiceProvider} from "../../models/ServiceProvider";
import {RepoInfo} from "../../../../types";

export function NodeJS(source: RepoInfo, config: Partial<IServiceConfig> = {}): ServiceProvider {
  return new ServiceProvider(source, config, {
    runtime: 'node:18',
    commands: ({ manager }) => [
      manager.run('install'),
      manager.run('start')
    ]
  });
}
