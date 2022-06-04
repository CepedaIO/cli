import {config} from "../configs/e2e";
import {cleanup, expectExists, setup} from "./utils";
import {expect} from "chai";
import {MockCLIUser} from "@vlegm/utils";
import {copyFiles} from "../dist/commands/ws/services/copyFiles";
import {AsyncFunc} from "mocha";
import {readdir} from "fs/promises";

interface RunOptions {
  output?: boolean;
  flags?: 'skip' | 'only' | '';
}

export interface ServiceSpec {
  name: string;
  type: 'node';
  tail?: string[];
  test?: () => void;
}

interface StandardTesterOptions {
  skipCleanup?: boolean;
}

class _MockCLIUser extends MockCLIUser {
  constructor(
    public command: string,
    public args: string[],
    options: RunOptions
  ) {
    super(command, args, {
      cwd: config.tmpDir,
      output: options.output === true ? console.log : undefined
    });
  }
}

function _it(title:string, cb:AsyncFunc, options:RunOptions) {
  let mochaIt = options.flags ? it[options.flags] : it;

  return mochaIt(title, async function(...args) {
    this.timeout(0);
    await cb.apply(this, args);
  });
}

export class StandardTester {
  constructor(
    public tmpDir: string,
    public testDir: string,
    public services?: ServiceSpec[],
    public options: StandardTesterOptions = {}
  ) {
    before(async function() {
      this.timeout(0);
      if(options.skipCleanup !== true) {
        await cleanup();
      }

      await setup();
      await copyFiles([
        `${testDir}/compose-provider.ts`
      ], tmpDir);
    });
  }

  shouldUnpackProject(options: RunOptions = {}) {
    const services = this.services;
    return _it('should initialize workstation', async function () {
      const user = new _MockCLIUser('vlm', ['ws', 'unpack'], options);

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
      expect(files.length).to.equal(services?.length || 0, `There are ${services?.length || 0} services`);

      if(services) {
        services.forEach((service) => {
          if(service.type === "node") {
            const servicePath = `${config.tmpDir}/services/${service.name}`;

            expectExists([
              `node_modules`,
              `yarn.lock`
            ], servicePath);
          }
        })
      }
    }, options);
  }

  shouldShowProjectAsCreated(options:RunOptions = {}) {
    return _it('should show project as created', async function() {
      const user = new _MockCLIUser('vlm', ['ws', 'projects'], options);

      await user.test([
        "tmp"
      ]);
    }, options);
  }

  shouldIncludeService(specs: {
    serviceName?: string;
    otherServices?: string[];
  } = {}, options:RunOptions = {}) {
    return _it('should include service', async function() {
      const services = specs.otherServices || [];
      const user = specs.serviceName ?
        new _MockCLIUser('vlm', ['ws', 'include', specs.serviceName, 'tmp'], options) :
        new _MockCLIUser('vlm', ['ws', 'include', 'tmp'], options);

      if(specs.serviceName) {
        services.push(specs.serviceName);
      }

      if(services.length > 0) {
        await user.encounterAll(services);
      } else {
        await user.waitFor('Nothing included!');
      }
    }, options);
  }

  shouldExcludeService(specs: {
    serviceName?: string;
    otherServices?: string[];
  } = {}, options:RunOptions = {}) {
    return _it('should exclude service', async function() {
      const services = specs.otherServices || [];
      const user = specs.serviceName ?
        new _MockCLIUser('vlm', ['ws', 'exclude', specs.serviceName, 'tmp'], options) :
        new _MockCLIUser('vlm', ['ws', 'exclude', 'tmp'], options);

      if(specs.serviceName) {
        services.push(specs.serviceName);
      }

      if(services.length > 0) {
        await user.encounterAll(services);
      } else {
        await user.waitFor('Nothing excluded!');
      }
    }, options);
  }

  shouldBeAbleToStart(options:RunOptions = {}) {
    return _it('should be able to start', async function() {
      const user = new _MockCLIUser('vlm', ['ws', 'start', 'tmp'], options);

      user.specTimeout = 15000;

      await user.test([
        'Hash:',
        'Starting project!'
      ]);

      await user.waitTillDone();
    }, options);
  }

  shouldTestForRunningServices(options:RunOptions = {}) {
    const services = this.services;
    if(!services) {
      return;
    }

    return _it('should test that services are running', async function() {
      services.forEach((service) => {
        if(service.test) {
          service.test();
        }
      });
    }, options);
  }

  shouldTailServices(options:RunOptions = {}) {
    const services = this.services;
    if(!services) {
      return;
    }

    return _it('should tail services for output', async function() {
      for(const serviceSpec of services) {
        if(serviceSpec.tail) {
          const user = new _MockCLIUser('vlm', ['ws', 'tail', serviceSpec.name, 'tmp'], options);

          user.specTimeout = 3000;

          await user.test(serviceSpec.tail);
          await user.waitTillDone();
        }
      }

    }, options);
  }

  shouldRemoveProject(options:RunOptions = {}) {
    return _it('should remove project', async function() {
      const user = new _MockCLIUser('vlm', ['ws', 'remove', 'tmp'], options);

      user.specTimeout = 5000;

      await user.test([
        ['Are you sure you want to delete?', 'y'],
        'Stopping project!',
        'tmp has been removed!',
        ['Would you also like to delete the project\'s directory?', 'n']
      ]);
    }, options);
  }

  shouldNotShowProjectAsCreated(options:RunOptions = {}) {
    return _it('should not show tmp project as created', async function() {
      const user = new _MockCLIUser('vlm', ['ws', 'projects'], options);
      let err;

      try {
        await user.test([
          "tmp"
        ]);
      } catch(e) {
        err = e;
      }

      expect(err.message).to.equal('Waiting for timeout reached');
    }, options);
  }
}