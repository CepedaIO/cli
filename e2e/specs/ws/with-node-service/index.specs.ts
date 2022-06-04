import {config} from "../../../../configs/e2e";
import {StandardTester} from "../../../StandardTester";
import axios from "axios";
import {expect} from "chai";

describe.only('ws - Project with NodeJS service', () => {
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
  ]);

  standardTester.shouldUnpackProject();

  standardTester.shouldBeAbleToStart();

  standardTester.shouldTailServices();

  standardTester.shouldTestForRunningServices();

  standardTester.shouldBeAbleToStop();

  standardTester.shouldExcludeService({
    serviceName: 'server'
  }, { flags:"skip" })
});
