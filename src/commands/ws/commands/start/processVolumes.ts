import { ComposeProvider, Dict, DockerVolume} from "../../../../types";

export async function processVolumes(provider: ComposeProvider): Promise<Dict<DockerVolume>> {
  const volumes = provider.predefined?.reduce((res, serviceName) => ({
    ...res,
    [serviceName]: {}
  }), {} as Dict<DockerVolume>) || {};

  return  !provider.volumes ? volumes : {
    ...provider.volumes,
    ...volumes
  };
}