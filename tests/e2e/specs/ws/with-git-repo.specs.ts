import {expect} from "chai";
import {existsSync} from "fs";
import {MockCLIUser} from "@cepedaio/utils";
import {config} from "../../config";
import {join} from "path";

const suiteName = 'init-with-git-repo';
const suiteDir = join(config.tmpDir, suiteName);

describe('ws.init - Project with git repo ', () => {
  it('should initialize workstation', async function () {
    this.timeout(0);
    const user = new MockCLIUser('cpa', ['ws', 'init', suiteName], {
      cwd: config.tmpDir
    });

    await user.test([
      ['Add git repos?', 'y'],
      ['Git repo', 'git@github.com:cepedaio/cli.git'],
      ['Initialization command:', '\x0D'],
      ['Git repo', '\x0D'],
      ['Predefined Services:', '\x0D'],
      ['Add environment variables?','n'],
      ['Create your workstation?', 'y']
    ]);

    await user.waitTillDone();
  });

  it('should see initialized git repo', async function () {
    this.timeout(0);

    expect(existsSync(suiteDir)).to.be.true;
    expect(existsSync(`${suiteDir}/services/cli`)).to.be.true;
    expect(existsSync(`${suiteDir}/services/cli/node_modules`)).to.be.true;
    expect(existsSync(`${suiteDir}/services/cli/.git`)).to.be.true;
  });

  it('should remove project', async function() {
    this.timeout(0);
    const user = new MockCLIUser('cpa', ['ws', 'remove', suiteName], {
      cwd: suiteDir
    });

    await user.test([
      ['Are you sure you want to delete?', 'y'],
      ['Would you also like to delete the project\'s directory?', 'n']
    ]);

    await user.waitTillDone();
  });
});
