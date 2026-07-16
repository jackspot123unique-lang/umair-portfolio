# Portfolio Engr Umair Ahmad

This is the maintained production version of Umair Ahmad's original-UI full-stack portfolio.

Existing deployed integrations remain unchanged:

- Vercel — application and API deployment
- Neon PostgreSQL — editable portfolio content and contact messages
- Cloudflare R2 — direct, scalable file storage
- Resend — contact-form email delivery

## This revision

See [UPDATES.md](./UPDATES.md) for the new role animation, tag controls, category-correct uploads, compact Projects Work cards, separated Education/Certifications sections, and public preview restrictions.

## Important source files

- `public/portfolio-ui.html` — preserved portfolio UI and its original admin interface
- `app/api/` — authentication, portfolio saving, file-upload and contact APIs
- `lib/` — database, auth, storage, validation and rate-limit modules
- `prisma/` — production database schema/migration/seed
- `.env.example` — required environment-variable template; never commit `.env.local`

## Verify before deploying

```bash
npm install
npm run build
```

Use `npm run vercel-build` as the Vercel Build Command. The current Vercel, Neon, R2 and Resend environment values must stay configured exactly as they are in the existing live project.
