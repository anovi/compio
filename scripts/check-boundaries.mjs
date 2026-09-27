import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const failures = [];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}

for (const file of walk(path.join(root, 'apps'))) {
  if (!/\.[cm]?[jt]sx?$/.test(file)) continue;
  const source = fs.readFileSync(file, 'utf8');
  if (/packages\/[^'"\n]+\/src\//.test(source)) {
    failures.push(`${path.relative(root, file)} imports package source`);
  }
}

for (const file of walk(path.join(root, 'packages'))) {
  if (!/\.[cm]?[jt]sx?$/.test(file)) continue;
  const source = fs.readFileSync(file, 'utf8');
  if (/apps\/[^'"\n]+\/src\//.test(source)) {
    failures.push(`${path.relative(root, file)} imports application source`);
  }
}

for (const dir of ['packages/calculator', 'packages/editor', 'packages/web-ui']) {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, dir, 'package.json'), 'utf8'));
  for (const value of Object.values(manifest.exports ?? {})) {
    const targets = typeof value === 'string' ? [value] : Object.values(value);
    for (const target of targets) {
      if (typeof target !== 'string' || !target.startsWith('./dist/')) {
        failures.push(`${dir}/package.json exports non-dist target ${String(target)}`);
      }
    }
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
}
