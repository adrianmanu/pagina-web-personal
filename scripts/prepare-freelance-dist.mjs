import { execSync } from 'node:child_process';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const apkPath = join('dist', 'downloads', 'app-debug.apk');

if (existsSync(apkPath)) {
  unlinkSync(apkPath);
  console.log('Removed app-debug.apk from dist (Cloudflare Pages 25 MiB limit).');
}

const configPath = join('dist', 'demos', 'config.js');

if (existsSync(configPath)) {
  const config = readFileSync(configPath, 'utf8');
  const updated = config.replace(
    'window.PORTFOLIO_CONFIG = {',
    'window.PORTFOLIO_CONFIG = {\n  hideSourceCode: true,',
  );
  writeFileSync(configPath, updated);
  console.log('Enabled hideSourceCode for demo pages in freelance build.');
}

execSync('node scripts/generate-sitemap.mjs', { stdio: 'inherit' });
