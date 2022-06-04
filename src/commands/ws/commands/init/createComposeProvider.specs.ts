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
      } as DockerComposeConfig
    `);
  });

  it('should build compose with ssh git repos', async () => {
    const compose = await createComposeProvider({
      root: '',
      name: 'cli',
      repos: [
        {
          url: 'git@github.com:vlegm/cli.git',
          init: 'yarn install'
        }
      ]
    });

    expect(compose).to.equalIgnoreSpaces(`
      export default {
        "version": "3.7",
        "services": {
          "cli": {      
            "tty": true,           
            "command": (env: string, options: CommandOptions) => {
              return "yarn dev"
            },           
            "image": (env: string) => {
              return "nodejs:14"
            },          
            "volumes": ["/app:/home/alfred/repos/vlegm/cli/cli/cli"],       
          },
        }, 
        "volumes": {
        }
      } as DockerComposeConfig
    `);
  });
});
