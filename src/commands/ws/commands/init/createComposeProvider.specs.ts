import {createComposeProvider} from "./createComposeProvider";
import {expect} from "chai";

describe('createComposeProvider', () => {
  it('should build compose with predefined services', async () => {
    const compose = await createComposeProvider({
      root: '',
      name: 'cli',
      services: ['mysql']
    });

    expect(compose).to.equalIgnoreSpaces(`
      import { ComposeProvider, ProviderContext } from "@cepedaio/cli";
      
      export default {
        "version": "3.7",
        "services": {
          "mysql": {
              "image": "mysql:8",
              "ports": ["3306:3306"],
              "volumes": ["mysql:/var/lib/mysql"],
            },
        },
        "volumes": {
          "mysql": {},
        }
      } as ComposeProvider
    `);
  });

  it('should build compose with ssh git repos', async () => {
    const compose = await createComposeProvider({
      root: '',
      name: 'cli',
      repos: [
        {
          url: 'git@github.com:cepedaio/cli.git',
          init: 'yarn install'
        }
      ]
    });

    expect(compose).to.equalIgnoreSpaces(`
      import { ComposeProvider, ProviderContext } from "@cepedaio/cli";
      
      export default {
        "version": "3.7",
        "services": {
          "cli": {
            "repo": {"url":"git@github.com:cepedaio/cli.git","init":"yarn install"},
            "tty": true,
            "command": (context:ProviderContext) => {
              return "yarn dev"
            },
            "image": (context:ProviderContext) => {
              return "vlegm/dev-alpine:latest"
            },
            "volumes": ["./cli:/mnt/host"],
          },
        },
        "volumes": {
        }
      } as ComposeProvider
    `);
  });
});
