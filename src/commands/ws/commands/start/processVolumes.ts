import {
  Dict,
  DockerVolume,
  isServiceFactory,
  NormalizedComposeProvider,
  ProviderContext,
  StartOptions
} from "../../../../types";

export async function processVolumes(provider: NormalizedComposeProvider, options: StartOptions): Promise<Dict<DockerVolume>> {
  let volumes: Dict<{}> = {};

  for (const [serviceName, serviceDef] of Object.entries(provider.services || {})) {
    if(isServiceFactory(serviceDef) && serviceDef.volumes) {
      const context:ProviderContext = {
        name: serviceName,
        options
      };

      const newVolumes = serviceDef.volumes(context);
      volumes = {
        ...volumes,
        ...newVolumes
      }
    }
  }

  return !provider.volumes ? volumes : {
    ...provider.volumes,
    ...volumes
  }
}