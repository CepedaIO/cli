import {config} from "../../../../configs/e2e";
import {StandardTester} from "../../../StandardTester";
import axios from "axios";
import {expect} from "chai";

describe('ws - Project with NodeJS service', () => {
  let standardTester:StandardTester = new StandardTester(config.tmpDir, __dirname, [
    {
      name:'server',
      type:'node',
      tail: [
        'yarn install',
        'Listening: 3000',
      ],
      async test() {
        const resp = await axios.get('http://localhost:3000');
        expect(resp.data).to.equal('Hello World!');
      }
    }
  ], {
    skipCleanup: true
  });

  standardTester.shouldUnpackProject({ flags:"" });

  standardTester.shouldBeAbleToStart({ flags:"" });

  standardTester.shouldTailServices({
    flags: "only"
  });

  standardTester.shouldTestForRunningServices()

  standardTester.shouldExcludeService({
    serviceName: 'server'
  })
});
