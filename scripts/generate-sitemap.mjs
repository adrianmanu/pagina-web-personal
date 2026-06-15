import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const siteUrl = (process.env.VITE_SITE_URL || 'https://adrian-ramos.pages.dev').replace(
  /\/$/,
  '',
);

const paths = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/demos/automatizacion-datos/', priority: '0.8', changefreq: 'monthly' },
  { path: '/demos/inventory-api/', priority: '0.8', changefreq: 'monthly' },
  { path: '/demos/task-manager-api/', priority: '0.8', changefreq: 'monthly' },
  { path: '/demos/metrics-dashboard/', priority: '0.8', changefreq: 'monthly' },
  { path: '/demos/ecommerce-store/', priority: '0.8', changefreq: 'monthly' },
  { path: '/demos/gusvivan-mobile/', priority: '0.8', changefreq: 'monthly' },
  { path: '/demos/utic-documental/', priority: '0.7', changefreq: 'monthly' },
  { path: '/apps/automatizacion-datos/', priority: '0.7', changefreq: 'monthly' },
  { path: '/apps/inventory-api/', priority: '0.7', changefreq: 'monthly' },
  { path: '/apps/task-manager/', priority: '0.7', changefreq: 'monthly' },
  { path: '/apps/ecommerce-store/', priority: '0.7', changefreq: 'monthly' },
  { path: '/metrics-dashboard/', priority: '0.7', changefreq: 'monthly' },
];

const lastmod = new Date().toISOString().split('T')[0];

const urls = paths
  .map(
    ({ path, priority, changefreq }) => `  <url>
    <loc>${siteUrl}${path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`,
  )
  .join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

writeFileSync(join('dist', 'sitemap.xml'), sitemap);
writeFileSync(join('dist', 'robots.txt'), robots);

console.log(`Generated sitemap.xml and robots.txt for ${siteUrl}`);
