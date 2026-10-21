import type {E2EConfig} from 'e2e';
import {dsmTarget,magpieAgent} from '@synopackageland/cli/e2e';
export default {
  tests:['*.e2e.ts'], targets:[dsmTarget()], workers:1, retries:0,
  timeout:300_000, actionTimeout:20_000, output:process.env.DSM_E2E_OUTPUT_DIR,
  agents:{default:{...magpieAgent(),maxModelCalls:30,maxSteps:60}},
} satisfies E2EConfig;
