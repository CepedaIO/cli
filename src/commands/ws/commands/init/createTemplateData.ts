import {ComposeProvider, Dict, DockerService, WorkstationAnswers, ServiceFromRepo } from "../../../../types";
import dockerServices from "../../dockerServices"

function getName(gitUrl: string): string | undefined {
  const matches = gitUrl.match(/\/(?<name>.+).git/);

  return matches?.groups?.name;
}

function servicesFromRepos(config: WorkstationAnswers) {
  if (!config.repos) {
    return {};
  }

  return config.repos.reduce((res, repo) => {
    const name = getName(repo.url);

    if (!name) {
      throw new Error('Unable to parse name, is this a valid git repo?');
    }

    res[name] = {
      repo,
      tty: true,
      command: 'yarn dev',
      image: 'vlegm/dev-alpine:latest',
      volumes: [
        `./${name}:/mnt/host`
      ]
    };

    return res;
  }, {} as Dict<DockerService | (DockerService & ServiceFromRepo)>)
}

function predefinedServices(config: WorkstationAnswers): ComposeProvider {
  if (!config.services) {
    return {
      version: "3.7"
    };
  }

  return config.services.reduce((res, service) => {
    res.services = {
      ...res.services,
      [service]: dockerServices[service]
    };

    res.volumes = {
      ...res.volumes,
      [service]: {}
    };

    return res;
  }, {
    services: {},
    volumes: {}
  } as ComposeProvider);
}

export function createTemplateData(config: WorkstationAnswers) {
  const repoServices = servicesFromRepos(config);
  const dockerServices = predefinedServices(config);

  return {
    version: '3.7',
    services: {
      ...dockerServices.services
    },
    repoServices: {
      ...repoServices,
    },
    volumes: {
      ...dockerServices.volumes
    }
  };
}
