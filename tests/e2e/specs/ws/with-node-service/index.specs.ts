import {StandardTester} from "../../../StandardTester";
import axios from "axios";
import {expect} from "chai";

describe('ws - Project with NodeJS service', () => {
  let standardTester:StandardTester = new StandardTester('with-node-service', __dirname, {
    skipCleanup: false,
  });

  standardTester.shouldInitializeWorkstation({
    server: 'node'
  });

  standardTester.shouldBeAbleToStart({
    server: {
      tail: [
        'yarn install',
        'Listening: 3000'
      ],
      afterStart: async () => {
        const resp = await axios.get('http://localhost:3000');
        expect(resp.data).to.equal('Hello World!');
      }
    }
  });

  standardTester.shouldBeAbleToStop();

  standardTester.shouldExcludeService({
    serviceName: 'server'
  }, { flags: 'skip' });
});
