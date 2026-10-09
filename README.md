# GMB Scraper

Next.js 15 + Tailwind 4 + Supabase. Landing page, login/sign-up popup (Google or email), and a dashboard
(overview, search, saved pipeline with notes, history, settings). Dark and light themes, mobile-first.

## Run it
1. `npm install`
2. Copy `.env.example` to `.env.local` and fill it in.
3. Supabase → SQL Editor → run `supabase/schema.sql`, then `supabase/billing-admin.sql` (credits, payments, admin role).
4. Supabase → Auth → Providers → enable **Google** (add your Google OAuth client ID/secret).
5. Supabase → Auth → URL Configuration → add `http://localhost:3000/api/auth/callback` and your live `/api/auth/callback`.
6. `npm run dev`

## Where things are
- `components/landing/*` landing sections (theme works through CSS variables in `app/globals.css`)
- `components/auth/auth-modal.tsx` the login popup. Any link to `/login` or `/signup` opens it; `/login` and `/signup` pages still work as fallbacks
- `components/ui/hold-to-delete.tsx` press-and-hold confirm button (mouse, touch, keyboard)
- `components/dashboard/*` dashboard views, export (CSV / XLSX / JSON) in `export.ts`
- `lib/faqs.ts` one FAQ list used by the page, FAQ schema and `llms.txt`
- SEO: `app/layout.tsx`, `app/sitemap.ts`, `app/robots.ts`, `app/opengraph-image.tsx`, `components/seo/json-ld.tsx`

## Payments and admin
- 3 free lifetime searches, then credit packs (1 search = 1 credit). Pay by UPI, enter the 12-digit UTR, send the screenshot on WhatsApp.
- Set `NEXT_PUBLIC_UPI_ID`, `NEXT_PUBLIC_UPI_NAME`, `NEXT_PUBLIC_WHATSAPP_NUMBER` (and optionally `NEXT_PUBLIC_UPI_QR`) in `.env.local`.
- Admin = a row in `public.profiles` with `role = 'admin'`. Make yourself admin with the SQL at the bottom of `supabase/billing-admin.sql`. The panel is at `/admin`; everyone else gets a 404.
- Pack prices live in two places: the `credit_packs` table (what is charged) and `lib/billing.ts` (what is shown). Change both.

## Before you launch
The landing page has sample numbers (2.4M businesses, 190+ countries), and sample testimonials.
Replace the sample numbers and testimonials before going public.
