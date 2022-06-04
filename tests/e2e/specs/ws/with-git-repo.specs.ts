import {expect} from "chai";
import {existsSync} from "fs";
import {MockCLIUser} from "@vlegm/utils";
import {config} from "../../config";
import {join} from "path";

const suiteName = 'init-with-git-repo';
const suiteDir = join(config.tmpDir, suiteName);

describe.skip('ws.init - Project with git repo ', () => {
  it('should initialize workstation', async function () {
    this.timeout(0);
    const user = new MockCLIUser('vlm', ['ws', 'init', suiteName], {
      cwd: suiteDir
    });

    await user.test([
      ['Add git repos?', 'y'],
      ['Git repo', 'git@github.com:vlegm/cli.git'],
      ['Initialization command:'],
      ['Git repo'],
      ['Predefined Services:'],
      ['Add environment variables?','n'],
      ['Create your workstation?', 'y']
    ]);

    await user.waitTillDone();
  });

  it('should see initialized git repo', async function () {
    this.timeout(0);

    expect(existsSync(suiteDir)).to.be.true;
    expect(existsSync(`${suiteDir}/cli`)).to.be.true;
    expect(existsSync(`${suiteDir}/cli/node_modules`)).to.be.true;
    expect(existsSync(`${suiteDir}/cli/.git`)).to.be.true;
  });

  it('should remove project', async function() {
    this.timeout(0);
    const user = new MockCLIUser('vlm', ['ws', 'remove', suiteName], {
      cwd: suiteDir
    });

    await user.test([
      ['Are you sure you want to delete?', 'y'],
      ['Would you also like to delete the project\'s directory?', 'y']
    ]);

    await user.waitTillDone();
  });
});
