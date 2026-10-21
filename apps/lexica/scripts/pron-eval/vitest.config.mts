import { defineConfig } from 'vitest/config';

// Not part of CI: `PRON_EVAL_DIR=<unzipped /ghi-am folders> npx vitest run --config scripts/pron-eval/vitest.config.mts`
export default defineConfig({ test: { include: ['scripts/pron-eval/*.eval.ts'], environment: 'node', testTimeout: 600000 } });
