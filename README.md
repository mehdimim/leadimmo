# LeadImmo Landing + AI Blog

Cloudflare-first Next.js (App Router) project delivering a multilingual landing page, AI-driven blog workflow, and minimal admin for publishing content.

## Stack

- Next.js 14 + TypeScript + TailwindCSS
- Cloudflare Pages/Workers via @cloudflare/next-on-pages
- D1 database with Drizzle ORM
- next-intl (locales: en, th, fr, es, zh)
- Zod + react-hook-form for validation
- Vitest (unit) & Playwright (e2e)
- Optional SMTP/Resend notifications, Turnstile, GA4/META tracking

## Getting Started

1. Install dependencies
   `ash
   npm i
   `
2. Provision the D1 database
   `ash
   npx wrangler d1 create samui
   `
   Copy the returned database_id into wrangler.toml under [[d1_databases]].
3. Copy environment template and configure values
   `ash
   cp .env.example .env
   `
   Fill in Cloudflare bindings (CRON_TOKEN, TURNSTILE, SMTP/Resend, LLM, NEXT_PUBLIC_SITE_URL, AGENCY_* etc.).
4. Generate Drizzle migrations snapshot (optional when schema changes)
   `ash
   npm run db:generate
   `
5. Apply migrations to the local D1 instance
   `ash
   npm run db:migrate:local
   `
6. Seed pillar posts (English versions only)
   `ash
   npm run seed
   `
7. Preview the Pages build locally
   `ash
   npm run preview
   `
   The site serves under the Cloudflare Pages dev server (default http://localhost:8788).

## Scripts

- 
pm run dev – Next.js development server (Node)
- 
pm run build – 
ext build + @cloudflare/next-on-pages
- 
pm run preview – Cloudflare Pages preview (wrangler pages dev)
- 
pm run deploy – Deploy to Cloudflare Pages
- 
pm run db:generate – Generate D1 SQL migrations with Drizzle
- 
pm run db:migrate:local / 
pm run db:migrate:prod – Apply migrations locally or in production
- 
pm run seed – Seed D1 with the five published pillar posts
- 
pm test – Vitest unit suite
- 
pm run e2e – Playwright tests (lead submission flow)
- 
pm run cron:dry-run – Inspect cron draft generation logic without touching the DB

## Database (D1 + Drizzle)

- Schema defined in db/schema.ts
- Migrations stored under migrations/
- Runtime access through getDB() (Cloudflare request context)
- Scheduled cron uses createDBFromBinding to reuse the same logic
- Seed script leverages wrangler d1 execute to populate published pillar articles

## Cloudflare Cron & API

- Manual trigger: POST /api/cron/generate-post with Authorization: Bearer 
- Automatic trigger: Cloudflare Cron (	riggers.crons) runs daily and calls the same generator via unctions/_worker.ts
- Generator creates an English draft, then auto-translates to TH/FR/ES/ZH when LLM_API_KEY and AUTO_TRANSLATE_LOCALES are provided; falls back to [TRANSLATION NEEDED] otherwise

## Admin & Leads

- Login /{locale}/admin/login (credentials from ADMIN_USER / ADMIN_PASS)
- Manage posts /[locale]/admin/posts (publish/unpublish/delete/translate)
- Export leads CSV via /api/leads/export
- Lead form includes honeypot, Turnstile (when keys configured), and in-memory IP rate limiting
- Notifications sent through Resend or SMTP when credentials exist; otherwise the event is logged

## Sitemap & SEO

- Locale-prefixed routing with middleware redirect (/ → /en)
- 
ext-sitemap.config.js outputs hreflang-aware sitemaps for the five locales
- JSON-LD includes RealEstateAgent, Article, and BreadcrumbList with inLanguage

## Cron Testing

Local manual trigger example (Pages preview @ http://localhost:8788):
`ash
curl -X POST \
  http://localhost:8788/api/cron/generate-post \
  -H "Authorization: Bearer "
`

## Environment Variables

Key variables consumed at runtime:

- CRON_TOKEN
- ADMIN_USER, ADMIN_PASS
- TURNSTILE_SITE_KEY, TURNSTILE_SECRET_KEY
- LLM_API_KEY, LLM_API_URL, LLM_API_MODEL, AUTO_TRANSLATE_LOCALES
- FROM_EMAIL, CONTACT_EMAIL, SMTP/Resend credentials
- NEXT_PUBLIC_SITE_URL
- AGENCY_NAME, AGENCY_PHONE, AGENCY_CITY

Populate these in .env (for local tooling) and Cloudflare project settings (for production).

---

MIT License. See LICENSE for details.
