import { loadEnv } from 'vite';
import { spawnSync } from 'node:child_process';
const values = { ...loadEnv('production', process.cwd(), ''), ...process.env };
if (!['static', 'supabase'].includes(values.CONTENT_SOURCE || 'static'))
  throw new Error('CONTENT_SOURCE inválido.');
if ((values.CONTENT_SOURCE || 'static') === 'static') {
  const check = spawnSync(process.execPath, ['scripts/validate-content.mjs'], {
    stdio: 'inherit',
  });
  if (check.status !== 0) process.exit(check.status ?? 1);
}
// Assets are already versioned. Publishing poems never runs this build.
const result = spawnSync(
  process.execPath,
  ['node_modules/vinext/dist/cli.js', 'build'],
  { stdio: 'inherit', env: values },
);
if (result.error) throw result.error;
process.exit(result.status ?? 1);
