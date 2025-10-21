import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pillarsPath = path.join(__dirname, '..', 'data', 'pillars.json');
const keywordsPath = path.join(__dirname, '..', 'data', 'keywords.json');

const pillars = JSON.parse(readFileSync(pillarsPath, 'utf8'));
const keywords = JSON.parse(readFileSync(keywordsPath, 'utf8'));

const now = "strftime('%s','now')";

const upsertStatements = pillars.map((pillar) => {
  const id = randomUUID();
  const slug = pillar.slug.replace(/'/g, "''");
  const title = pillar.title.replace(/'/g, "''");
  const excerpt = (pillar.excerpt ?? '').replace(/'/g, "''");
  const bodyHtml = pillar.bodyHtml.replace(/'/g, "''");
  const category = (pillar.category ?? 'market').replace(/'/g, "''");
  const seoJson = JSON.stringify({ keywords: pillar.keywords ?? [] }).replace(/'/g, "''");

  return `
INSERT INTO posts (id, created_at, updated_at, slug, title, status, excerpt, body_html, category, pillar, seo_json)
VALUES ('${id}', ${now}, ${now}, '${slug}', '${title}', 'published', '${excerpt}', '${bodyHtml}', '${category}', 1, json('${seoJson}'))
ON CONFLICT(slug) DO UPDATE SET
  title = excluded.title,
  excerpt = excluded.excerpt,
  body_html = excluded.body_html,
  category = excluded.category,
  pillar = 1,
  status = 'published',
  seo_json = excluded.seo_json,
  updated_at = ${now};
`.trim();
});

const sql = upsertStatements.join('\n');

const command = `wrangler d1 execute samui --local --command "${sql.replace(/\n/g, ' ')}"`;

try {
  execSync(command, { stdio: 'inherit' });
  console.log(`Seed completed for ${pillars.length} pillar posts and ${keywords.length} keywords reference.`);
} catch (error) {
  console.error('Seed failed', error);
  process.exit(1);
}
