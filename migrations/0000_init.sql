CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  ip TEXT,
  first_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  budget TEXT,
  property_type TEXT,
  areas TEXT NOT NULL DEFAULT '[]',
  timing TEXT,
  call_preference TEXT,
  timezone TEXT NOT NULL DEFAULT 'Asia/Bangkok',
  message TEXT,
  locale TEXT NOT NULL DEFAULT 'en'
);

CREATE TABLE IF NOT EXISTS consents (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL UNIQUE,
  text_version TEXT NOT NULL,
  accepted_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  type TEXT NOT NULL,
  meta_json TEXT,
  lead_id TEXT,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  excerpt TEXT,
  body_html TEXT NOT NULL,
  category TEXT,
  pillar INTEGER NOT NULL DEFAULT 0,
  seo_json TEXT
);

CREATE TABLE IF NOT EXISTS post_translations (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  locale TEXT NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  body_html TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS post_translations_post_locale_idx
  ON post_translations (post_id, locale);
