import {config} from "../../../../configs/e2e";
import {StandardTester} from "../../../StandardTester";

describe('ws - Project with NodeJS service', () => {
  let standardTester:StandardTester = new StandardTester(config.tmpDir, __dirname, [
    {
      name:'server',
      type:'node',
      tail: [
        'yarn install',
        'Listening: 8080',
      ]
    }
  ], {
    skipCleanup: false
  });

  standardTester.shouldUnpackProject({
    flags: "only"
  });

  standardTester.shouldBeAbleToStart({
    flags: ""
  });

  standardTester.shouldTestForRunningServices({
    flags: ""
  })

  standardTester.shouldTailServices();

  standardTester.shouldExcludeService({
    serviceName: 'server'
  })
});
