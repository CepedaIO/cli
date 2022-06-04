import {expect} from "chai";
import {existsSync} from "fs";
import {MockCLIUser} from "@vlegm/utils";
import {config} from "../../configs/e2e";

describe.skip('ws.init - Project with git repo ', () => {
  it('should initialize workstation', async function () {
    this.timeout(0);
    const user = new MockCLIUser('vlm', ['ws', 'init', config.project], {
      cwd: config.tmpDir
    });

    await user.test([
      ['Use a config file?', 'n'],
      ['Add git repos?', 'y'],
      ['Git repo', 'git@github.com:vlegm/cli.git'],
      ['Initialization command:'],
      ['Git repo'],
      ['Predefined Services:'],
      ['Add environment variables?','n'],
      ['Create your workstation?', 'y'],
      ['Print workstation config?', 'y'],
      ['Destination?']
    ]);

    await user.waitTillDone();
  });

  it('should see initialized git repo', async function () {
    this.timeout(0);
    const projectDir = `${config.tmpDir}/${config.project}`;

    expect(existsSync(projectDir)).to.be.true;
    expect(existsSync(`${projectDir}/cli`)).to.be.true;
    expect(existsSync(`${projectDir}/cli/node_modules`)).to.be.true;
    expect(existsSync(`${projectDir}/cli/.git`)).to.be.true;
  });

  it('should remove project', async function() {
    this.timeout(0);
    const user = new MockCLIUser('vlm', ['ws', 'remove', config.project], {
      cwd: config.tmpDir
    });

    await user.test([
      ['Are you sure you want to delete?', 'y', `${config.project} has been removed!`],
      ['Would you also like to delete the project\'s directory?', 'y']
    ]);

    await user.waitTillDone();
  });
});
