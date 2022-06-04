import {cleanup, expectExists, setup} from "./utils";
import {expect} from "chai";
import {copyFiles, MockCLIUser} from "@vlegm/utils";
import {AsyncFunc} from "mocha";
import {readdir} from "fs/promises";
//@ts-ignore
import chalk from "chalk";
import {TestInputs} from "@vlegm/utils/dist/types";
import {config} from "./config";
import {join} from "path";

interface RunOptions {
  verbose?: boolean;
  flags?: 'skip' | 'only' | '';
}

interface StandardTesterOptions {
  skipCleanup?: boolean;
}

interface ServiceError {
  service: string;
  error: any;
}

function createCLIUser(command: string, args: string[], cwd:string, options: RunOptions) {
  if(options.verbose) {
    console.log(`Running command: ${chalk.blueBright(command, JSON.stringify(args))}`);
  }

  return new MockCLIUser(command, args, {
    cwd,
    output: options.verbose === true ? console.log : undefined
  })
}

function _it(title:string, cb:AsyncFunc, options:RunOptions) {
  let mochaIt = options.flags ? it[options.flags] : it;

  return mochaIt(title, async function(...args) {
    this.timeout(0);
    await cb.apply(this, args);
  });
}

function reportServiceErrors(errors:ServiceError[]) {
  if(errors.length > 0) {
    console.log(chalk.redBright('Errors'), 'encountered when testing for running services');
    const errorMessage = errors
      .map((errorInfo) => `${errorInfo.service}: ${errorInfo.error}`)
      .join('\n');

    throw new Error(errorMessage);
  }
}

export class StandardTester {
  private readonly suiteDir:string;

  constructor(
    public suiteName: string,
    public testDir: string,
    public options: StandardTesterOptions = {}
  ) {
    const suiteDir = this.suiteDir = join(config.tmpDir, suiteName);

    before(async function() {
      this.timeout(0);
      if(options.skipCleanup !== true) {
        await cleanup(suiteName, suiteDir);
      }

      await setup(suiteDir);

      await copyFiles([
        join(testDir, 'compose-provider.ts')
      ], suiteDir);
    });
  }

  shouldInitializeWorkstation(services: NodeJS.Dict<string> = {}, options: RunOptions = {}) {
    return _it('should initialize workstation', async () => {
      const serviceEntries = Object.entries(services);
      const user = createCLIUser('vlm', ['ws', 'unpack'], this.suiteDir, options);

      await user.waitTillDone();

      expectExists([
        'node_modules/@vlegm',
        '.dist/compose-provider.js',
        'services',
        'package.json',
        'tsconfig.json',
        'yarn.lock',
      ], this.suiteDir);

      const files = await readdir(join(this.suiteDir, 'services'));
      expect(files.length).to.equal(serviceEntries.length || 0, `There are ${serviceEntries.length || 0} services`);

      serviceEntries.forEach(([service, type]) => {
        if(type === "node") {
          const servicePath = join(this.suiteDir, 'services', service);

          expectExists([
            `node_modules`,
            `yarn.lock`
          ], servicePath);
        }
      });
    }, options);
  }

  shouldShowProjectAsCreated(options:RunOptions = {}) {
    return _it('should show project as created', async () => {
      const user = createCLIUser('vlm', ['ws', 'projects'], this.suiteDir, options);

      await user.test([
        this.suiteName
      ]);
    }, options);
  }

  shouldIncludeService(specs: {
    serviceName?: string;
    otherServices?: string[];
  } = {}, options:RunOptions = {}) {
    return _it('should include service', async () => {
      const services = specs.otherServices || [];
      const user = specs.serviceName ?
        createCLIUser('vlm', ['ws', 'include', specs.serviceName, this.suiteName], this.suiteDir, options) :
        createCLIUser('vlm', ['ws', 'include', this.suiteName], this.suiteDir, options);

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
    return _it('should exclude service', async () => {
      const services = specs.otherServices || [];
      const user = specs.serviceName ?
        createCLIUser('vlm', ['ws', 'exclude', specs.serviceName, this.suiteName], this.suiteDir, options) :
        createCLIUser('vlm', ['ws', 'exclude', this.suiteName], this.suiteDir, options);

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

  shouldBeAbleToStart(specs: {
    test?: TestInputs
    services?: NodeJS.Dict<{
      tail?: TestInputs,
      afterStart?: () => void
    }>
  } = {}, options:RunOptions = {}) {
    return _it('should be able to start', async () => {
      const user = createCLIUser('vlm', ['ws', 'start', this.suiteName], this.suiteDir, options);
      user.specTimeout = 15000;

      await user.test(specs.test || [
        'Hash:',
        'Starting project!'
      ]);

      await user.waitTillDone();

      const errors:ServiceError[] = [];
      for(const [service, actions] of Object.entries(specs.services || {})) {
        if(!actions) {
          break;
        }

        if (actions.tail) {
          const user = createCLIUser('vlm', ['ws', 'tail', service, this.suiteName], this.suiteDir, options);
          user.specTimeout = 60000;

          await user.test(actions.tail);
          user.process.kill(9);
        }

        if (actions.afterStart) {
          try {
            await actions.afterStart()
          } catch (error) {
            errors.push({
              service, error
            });
          }
        }
      }

      reportServiceErrors(errors);
    }, options);
  }

  shouldBeAbleToStop(options:RunOptions = {}) {
    return _it('should be able to stop', async () => {
      const user = createCLIUser('vlm', ['ws', 'stop', this.suiteName], this.suiteDir, options);

      user.specTimeout = 15000;

      await user.test([
        'Stopping project!'
      ]);

      await user.waitTillDone();
    }, options);
  }

  shouldRemoveProject(options:RunOptions = {}) {
    return _it('should remove project', async () => {
      const user = createCLIUser('vlm', ['ws', 'remove', this.suiteName], this.suiteDir, options);

      user.specTimeout = 5000;

      await user.test([
        ['Are you sure you want to delete?', 'y'],
        'Stopping project!',
        `${this.suiteName} has been removed!`,
        ['Would you also like to delete the project\'s directory?', 'n']
      ]);
    }, options);
  }

  shouldNotShowProjectAsCreated(options:RunOptions = {}) {
    return _it(`should not show ${this.suiteName} project as created`, async () => {
      const user = createCLIUser('vlm', ['ws', 'projects'], this.suiteDir, options);
      let err;

      try {
        await user.test([
          this.suiteName
        ]);
      } catch(e) {
        err = e;
      }

      expect(err.message).to.equal(`Unresolved prompt: ${this.suiteName}`);
    }, options);
  }
}
