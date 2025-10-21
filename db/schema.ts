import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const leads = sqliteTable('leads', {
  id: text('id').primaryKey(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  ip: text('ip'),
  firstName: text('first_name').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),
  budget: text('budget'),
  propertyType: text('property_type'),
  areas: text('areas', { mode: 'json' })
    .$type<string[]>()
    .notNull()
    .default(sql`'[]'`),
  timing: text('timing'),
  callPreference: text('call_preference'),
  timezone: text('timezone').notNull().default('Asia/Bangkok'),
  message: text('message'),
  locale: text('locale').notNull().default('en')
});

export const consents = sqliteTable('consents', {
  id: text('id').primaryKey(),
  leadId: text('lead_id')
    .notNull()
    .references(() => leads.id, { onDelete: 'cascade' })
    .unique(),
  textVersion: text('text_version').notNull(),
  acceptedAt: integer('accepted_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`)
});

export const events = sqliteTable('events', {
  id: text('id').primaryKey(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  type: text('type').notNull(),
  metaJson: text('meta_json', { mode: 'json' }).$type<Record<string, unknown> | null>(),
  leadId: text('lead_id').references(() => leads.id, { onDelete: 'set null' })
});

export const posts = sqliteTable('posts', {
  id: text('id').primaryKey(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  status: text('status', { enum: ['draft', 'published'] })
    .notNull()
    .default('draft'),
  excerpt: text('excerpt'),
  bodyHtml: text('body_html').notNull(),
  category: text('category'),
  pillar: integer('pillar', { mode: 'boolean' }).notNull().default(false),
  seoJson: text('seo_json', { mode: 'json' }).$type<Record<string, unknown> | null>()
});

export const postTranslations = sqliteTable(
  'post_translations',
  {
    id: text('id').primaryKey(),
    postId: text('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    locale: text('locale').notNull(),
    title: text('title').notNull(),
    excerpt: text('excerpt'),
    bodyHtml: text('body_html').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(strftime('%s', 'now'))`)
  },
  (table) => ({
    postLocaleUnique: uniqueIndex('post_translations_post_locale_idx').on(
      table.postId,
      table.locale
    )
  })
);

