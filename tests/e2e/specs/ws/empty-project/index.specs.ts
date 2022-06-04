import {StandardTester} from "../../../StandardTester";

describe('ws - Empty Project', () => {
  let standardTester:StandardTester = new StandardTester('empty-project', __dirname);

  standardTester.shouldInitializeWorkstation();

  standardTester.shouldShowProjectAsCreated();

  standardTester.shouldIncludeService()

  standardTester.shouldExcludeService();

  standardTester.shouldBeAbleToStart();

  standardTester.shouldRemoveProject();

  standardTester.shouldNotShowProjectAsCreated();
});
