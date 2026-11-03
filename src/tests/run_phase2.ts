import { runPhase2SelfTest } from './phase2_test';

runPhase2SelfTest()
  .then(() => {
    console.log('Phase 2 Self-Test execution completed.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Phase 2 Self-Test failed:', err);
    process.exit(1);
  });
