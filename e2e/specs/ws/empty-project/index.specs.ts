import {config} from "../../../../configs/e2e";
import {StandardTester} from "../../../StandardTester";

describe('ws - Empty Project', () => {
  let standardTester:StandardTester = new StandardTester(config.tmpDir, __dirname);

  standardTester.shouldUnpackProject();

  standardTester.shouldShowProjectAsCreated();

  standardTester.shouldIncludeService()

  standardTester.shouldExcludeService();

  standardTester.shouldBeAbleToStart();

  standardTester.shouldRemoveProject();

  standardTester.shouldNotShowProjectAsCreated();
});
