import {StandardTester} from "../../../StandardTester";

describe('ws - Empty Project', () => {
  let standardTester:StandardTester = new StandardTester('empty-project', __dirname, {
  });

  standardTester.shouldInitializeWorkstation({}, {
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
      'Starting project!'
    ]
  }, {
    verbose: true
  });

  standardTester.shouldRemoveProject();

  standardTester.shouldNotShowProjectAsCreated();
});
