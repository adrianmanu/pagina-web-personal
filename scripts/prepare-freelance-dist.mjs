import { existsSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

const apkPath = join('dist', 'downloads', 'app-debug.apk');

if (existsSync(apkPath)) {
  unlinkSync(apkPath);
  console.log('Removed app-debug.apk from dist (Cloudflare Pages 25 MiB limit).');
}
