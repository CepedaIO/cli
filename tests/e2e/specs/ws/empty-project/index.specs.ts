import {StandardTester} from "../../../StandardTester";

describe('ws - Empty Project', () => {
  let standardTester:StandardTester = new StandardTester('empty-project', __dirname, {
  });

  standardTester.shouldInitializeWorkstation({}, {
    verbose: true
  });

  standardTester.shouldShowProjectAsCreated();

  standardTester.shouldBeAbleToStart({
    test: [
      'Hash:',
      'Compose changed, building environment',
      'Initializing Project',
      'No environment defined for: local'
    ]
  }, {
    verbose: true
  });

  standardTester.shouldRemoveProject();

  standardTester.shouldNotShowProjectAsCreated();
});
