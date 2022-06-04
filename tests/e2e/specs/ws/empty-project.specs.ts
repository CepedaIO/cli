import {expect} from "chai";
import {MockCLIUser} from "@vlegm/utils";
import {config} from "../../config";

const suiteName = 'init-empty-project';

describe.only('ws.init - Empty Project', () => {
  it('should initialize workstation', async function () {
    this.timeout(0);
    const user = new MockCLIUser('vlm', ['ws', 'init', suiteName], {
      cwd: config.tmpDir
    });

    await user.test([
      ['Add git repos?', 'n'],
      ['Predefined Services:', '\x0D'],
      ['Add environment variables?','n'],
      ['Create your workstation?', 'y'],
    ]);

    await user.waitTillDone();
  });

  it('should be seen in projects', async function() {
    this.timeout(0);
    const user = new MockCLIUser('vlm', ['ws', 'projects']);

    const output = await user.nextMessage();
    expect(output.includes(suiteName)).to.be.true;

    await user.waitTillDone();
  });

  it('should remove project', async function() {
    this.timeout(0);
    const user = new MockCLIUser('vlm', ['ws', 'remove', suiteName]);

    await user.test([
      ['Are you sure you want to delete?', 'y'],
      ['Would you also like to delete the project\'s directory?', 'n']
    ]);

    await user.waitTillDone();
  });

  it('should no longer be seen in projects', async function() {
    this.timeout(0);
    const user = new MockCLIUser('vlm', ['ws', 'projects']);

    const output = await user.nextMessage();
    expect(output.includes(suiteName)).to.be.false;

    await user.waitTillDone();
  });
});
