# Admin panel update

## Setup (2 steps)
1. Supabase -> SQL Editor -> run `supabase/admin-controls.sql` once (safe to re-run).
2. Copy the files from this zip over your project (same folders). Nothing new to install.

## What the admin can do now (/admin)
- Overview: users, active today, searches, revenue, credits held, pending payments, new feedback, 14-day chart
- Users: search + filters, block/unblock (with reason the user sees), add/remove credits,
  daily search limit per user, reset free searches, export CSV
- Payments: same as before, now its own tab (/admin/payments)
- Feedback: inbox with New/Seen/Resolved, reply to the user
- Settings: default daily limit for everyone, pause all searching, announcement banner, activity log

## User side
- /dashboard/feedback: send a bug / idea / praise with a star rating, see replies
- Blocked users see a "suspended" screen; limits and pause show clear messages on search

## Files
NEW: supabase/admin-controls.sql, lib/admin-db.ts, lib/admin-guard.ts,
     app/admin/{layout,users,payments,feedback,settings}, app/api/admin/{users,feedback,settings},
     app/api/feedback, app/dashboard/feedback/*, components/admin/{admin-nav,admin-users,admin-feedback,admin-settings,setup-notice},
     components/dashboard/{feedback-view,blocked-screen}
CHANGED: app/admin/page.tsx (now Overview), app/dashboard/layout.tsx, app/api/leads/route.ts,
         lib/billing-db.ts, components/dashboard/app-shell.tsx (Feedback link)
