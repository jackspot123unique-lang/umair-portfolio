# Umair Ahmad Portfolio — Original UI Full-Stack Edition

This is a full-stack conversion of the supplied portfolio **without redesigning its appearance**.

## UI preservation promise

`public/portfolio-ui.html` keeps the supplied page’s:

- original layout, sections, content, colors, typography, spacing, animations, responsive breakpoints, cards, dialogs, gallery, project tabs, and admin controls;
- original editable data model and all displayed portfolio information;
- original single-page interaction patterns.

The intentional UI-level removal is the broken **Download Updated HTML** button. The upload helper message changes only inside the existing admin upload modal to accurately describe cloud uploads. No redesign was applied.

## What changed behind the same UI

- The client-side password comparison was replaced with a server-side bcrypt comparison and signed HttpOnly session cookie.
- Browser `localStorage`, embedded data URLs, compression caps, and the 2 MB per-file / ~5 MB browser quota were removed.
- `Save Portfolio` now persists the same editable data structure to PostgreSQL.
- File uploads go from the browser directly to Cloudflare R2 through short-lived signed URLs.
- Files above 64 MB use multipart R2 upload; no file body is sent through Vercel.
- The contact form now uses a validated, rate-limited backend endpoint, stores messages in PostgreSQL, and optionally delivers them through Resend.
- The project includes a public single-file static version named `portfolio-static.html`.

## Files

- `public/portfolio-ui.html` — exact original visual UI, connected to full-stack APIs
- `portfolio-static.html` — standalone public/view-only HTML version with the same UI
- `app/api/` — authentication, portfolio persistence, uploads, contact endpoints
- `prisma/` — PostgreSQL schema, migration, and seed
- `DEPLOYMENT.md` — complete setup and deployment guide

## Quick start

```bash
cp .env.example .env.local
npm install
npm run password:hash -- "UmairBIM@2026"
# Put the command output in ADMIN_PASSWORD_HASH in .env.local
npm run db:deploy
npm run db:seed
npm run dev
```

Open `http://localhost:3000`. See [DEPLOYMENT.md](./DEPLOYMENT.md) for Cloudflare R2, PostgreSQL, GitHub, Vercel and verification details.
