import {StandardTester} from "../../../StandardTester";

describe.only('ws - Empty Project', () => {
  let standardTester:StandardTester = new StandardTester('empty-project', __dirname, {
  });

  standardTester.shouldInitializeWorkstation({}, {
    flags: "only",
    verbose: true
  });

  standardTester.shouldShowProjectAsCreated();

  standardTester.shouldIncludeService();

  standardTester.shouldExcludeService();

  standardTester.shouldBeAbleToStart({
    test: [
      'Hash:',
      'Compose changed, building environment',
      'Initializing Project',
      'Creating: docker-compose.yaml',
      'Starting project!',
      'no service selected'
    ]
  }, {
    flags: "skip",
    verbose: true
  });

  standardTester.shouldRemoveProject();

  standardTester.shouldNotShowProjectAsCreated();
});
