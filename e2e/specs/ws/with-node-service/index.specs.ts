import {config} from "../../../../configs/e2e";
import {StandardTester} from "../../../StandardTester";

describe.only('ws - Project with NodeJS service', () => {
  let standardTester:StandardTester = new StandardTester(config.tmpDir, __dirname, { skipCleanup: false });

  standardTester.shouldUnpackProject({
    flags: "only"
  });

  standardTester.shouldBeAbleToStart();
});
