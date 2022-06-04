import {config} from "../../../../configs/e2e";
import {ServiceSpec, StandardTester} from "../../../StandardTester";

describe.only('ws - Project with NodeJS service', () => {
  let standardTester:StandardTester = new StandardTester(config.tmpDir, __dirname, { skipCleanup: true });
  const services:ServiceSpec[] = [
    {
      name:'server',
      type:'node',
      tail: [
        'yarn install',
        'Hello World!',
      ]
    }
  ];

  standardTester.shouldUnpackProject({ services });

  standardTester.shouldBeAbleToStart();

  standardTester.shouldTailServices({
    services
  }, {
    output: true,
    flags: "only"
  })
});
