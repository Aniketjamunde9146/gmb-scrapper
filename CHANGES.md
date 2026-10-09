# What changed (payments, admin, cleanup)

## Run once in Supabase (SQL editor)
Run `supabase/billing-admin.sql`, then make yourself admin with the SQL at the bottom of that file.

## New
- Credits: 3 free lifetime searches, then packs. Each search is taken atomically in the database before it runs and is given back if our side fails.
- `/dashboard/billing`: pick a pack, pay by UPI (copy ID, QR, "open UPI app" on mobile), enter the 12-digit UTR, then a WhatsApp button opens with ref, pack, amount, UTR and email already filled in.
- `/admin`: pending payments with Approve / Reject (reason shown to the user). Approving adds the credits in one database step. Access comes from `profiles.role = 'admin'` and is checked on the page, in the API and inside the SQL functions.
- Sidebar shows searches left and updates after each search; out of credits sends the user to the packs page.
- Landing pricing now shows the credit packs instead of monthly plans that were never wired up.

## Removed (redundant)
- Sidebar "Quick scrape" button: it opened the same page as "Search leads".
- Unused files: components/site-header.tsx (old copy of the landing header), auth-form.tsx, search-form.tsx, ui/route-progress.tsx, components/motion/*, lib/supabase/middleware.ts (duplicate of middleware.ts).

## Fixed
- The SEO structured data (JsonLd) existed but was never added to the home page. It is now.

## Not verified
Could not run `npm install` or `next build` here (no network). Syntax was checked only. Run `npm run build` once and send me any error.

---
# What changed

## Run once in Supabase (SQL editor)
`alter table public.saved_leads add column if not exists follow_up date;`  (also added to supabase/schema.sql)
Without it everything still works; only follow-up dates fail with a clear message.

## New
- Lead score 0-100 with a "best angle" for every lead (lib/score.ts), sort and filter by it
- Search: cards or table, sort, bulk select, save all hot leads, export with score, step-by-step search loader, recent searches
- Write message sheet: WhatsApp, email or call script filled from the lead; sending marks it Contacted
- Templates page: edit and reuse outreach messages (stored in the browser)
- Saved: board view with drag and drop, follow-up dates, due filter, win rate
- Insights page: lead quality, funnel, top cities and niches, ratings, search days, next-best actions
- Overview: week-over-week trends, getting-started checklist, follow-ups, "contact these next", top niches and cities
- Quick search palette (Ctrl or Cmd + K), settings: edit name and search defaults
- Login and signup: split layout with illustration, loader after sign-in

## Restyled to match the landing
Buttons, cards, badges, tokens, sidebar, header, logo, skeletons and loaders (see DESIGN-SYSTEM.md).

## Removed
components/landing.zip (an old copy of the landing folder, now out of date).

## Not verified
I could not run `next build` here (no network, no package.json in the upload). Syntax was checked;
please run `npm run build` once and send me any error.
