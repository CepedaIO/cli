import {config} from "../../../configs/e2e";
import {MockCLIUser} from "@vlegm/utils";
import {cleanup, expectExists, setup} from "../../utils";
import {copyFiles} from "../../../dist/commands/ws/services/copyFiles";
import {readdir} from "fs/promises";
import {expect} from "chai";

describe.only('ws.start - Empty Project', () => {
  before(async () => {
    await cleanup();
    await setup();
    await copyFiles([
      `${__dirname}/compose-provider.ts`
    ], config.tmpDir);
  });

  it('should initialize workstation', async function () {
    this.timeout(0);
    const user = new MockCLIUser('vlm', ['ws', 'unpack'], config.tmpDir);

    await user.waitTillDone();

    expectExists([
      'node_modules/@vlegm',
      '.dist/compose-provider.js',
      'services',
      'package.json',
      'tsconfig.json',
      'yarn.lock',
    ], config.tmpDir);

    const files = await readdir(`${config.tmpDir}/services`);
    expect(files.length).to.equal(0, 'No services installed');
  });

  it('should show project as created', async function() {
    this.timeout(0);
    const user = new MockCLIUser('vlm', ['ws', 'projects'], config.tmpDir);
  })

  it('should be able to start', async function() {
    this.timeout(0);
    const user = new MockCLIUser('vlm', ['ws', 'start', 'tmp'], config.tmpDir);

    user.timeout = 10000;

    await user.test([
      'Hash:',
      'Starting project!'
    ]);

    expect(true).to.equal(true, 'Project started without hanging');
  });

  it('should remove project', async function() {
    this.timeout(0);
    const user = new MockCLIUser('vlm', ['ws', 'remove', 'tmp'], config.tmpDir);

    user.timeout = 10000;

    await user.test([
      ['Are you sure you want to delete?', 'y'],
      'Stopping project!',
      'tmp has been removed!',
      ['Would you also like to delete the project\'s directory?', 'n']
    ]);
  });
});
