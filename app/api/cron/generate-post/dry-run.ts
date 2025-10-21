import keywords from '@/data/keywords.json' assert { type: 'json' };
import pillars from '@/data/pillars.json' assert { type: 'json' };
import { slugify } from '@/lib/slug';

const keyword = keywords[0];
const pillar = pillars[0];

const slug = slugify(`${keyword.primary}-dry-run`);

console.table({
  title: `Koh Samui ${keyword.primary} outlook`,
  slug,
  excerpt: `Draft insight exploring ${keyword.primary} opportunities linked to ${pillar.title}.`
});

console.log('Signals preview:', keyword.signals.join(', '));

