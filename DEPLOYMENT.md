# Full deployment guide — Original UI preserved

This guide deploys the full-stack version while serving the original portfolio design at `/`.

## Architecture

| Need | Implementation |
| --- | --- |
| Original portfolio UI | The supplied HTML/CSS/JS is served from `public/portfolio-ui.html` at the site root |
| Admin password | bcrypt hash checked only by `/api/auth/login`; signed HttpOnly cookie |
| Editable portfolio data | PostgreSQL + Prisma JSON record |
| Images/documents | Direct browser-to-Cloudflare R2 signed uploads |
| Large files | Multipart upload over 64 MB; Vercel does not receive the file bytes |
| Contact form | Backend validation, rate limiting, PostgreSQL storage and optional Resend email |

No UI redesign was introduced. The only removed interface control is **Download Updated HTML**.

---

## 1. Run locally

### Requirements

- Node.js 20.9+ (Node 20 LTS recommended)
- npm 10+
- PostgreSQL (local Docker, Neon, Supabase, etc.)
- A Cloudflare account for R2 upload testing

### Start local PostgreSQL (optional Docker recipe)

```bash
docker run --name umair-postgres \
  -e POSTGRES_USER=portfolio \
  -e POSTGRES_PASSWORD=change-this-local-password \
  -e POSTGRES_DB=portfolio \
  -p 5432:5432 -d postgres:16
```

### Install and create environment file

```bash
cp .env.example .env.local
npm install
```

Set these values in `.env.local`:

```dotenv
APP_URL=http://localhost:3000
DATABASE_URL=postgresql://portfolio:change-this-local-password@localhost:5432/portfolio?schema=public
AUTH_SECRET=PASTE_A_RANDOM_48_CHARACTER_OR_LONGER_VALUE
```

Generate `AUTH_SECRET`:

```bash
openssl rand -base64 48
```

### Configure the requested admin password securely

Do **not** paste the plaintext password into JavaScript, HTML, GitHub, or Vercel logs. Generate a bcrypt hash locally:

```bash
npm run password:hash -- "UmairBIM@2026"
```

Copy the entire output into `.env.local`:

```dotenv
ADMIN_PASSWORD_HASH=$2a$12$...output-from-command...
```

The password is compared on the server only. It is not present in the public HTML or browser JavaScript.

### Add R2 variables

Complete section 4, then add:

```dotenv
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-scoped-r2-access-key
R2_SECRET_ACCESS_KEY=your-scoped-r2-secret
R2_BUCKET=umair-portfolio
R2_PUBLIC_BASE_URL=https://media.yourdomain.com
```

### Apply database migration, seed original content and start

```bash
npm run db:generate
npm run db:deploy
npm run db:seed
npm run dev
```

Visit `http://localhost:3000`. Confirm the original interface appears unchanged, open its existing lock button, and sign in using the requested password.

---

## 2. Push to GitHub

1. Create a new **private** GitHub repository.
2. Confirm `.env.local` is ignored:

   ```bash
   git status --ignored
   ```

3. Commit and push source only:

   ```bash
   git init
   git add .
   git commit -m "Production full-stack portfolio with original UI"
   git branch -M main
   git remote add origin https://github.com/YOUR-USER/umair-portfolio.git
   git push -u origin main
   ```

4. Inspect GitHub before sharing. There must be no `.env`, `ADMIN_PASSWORD_HASH`, password, R2 secret, database connection string or Resend key committed.

---

## 3. Connect PostgreSQL

Use Neon, Supabase PostgreSQL, Vercel Postgres or another managed PostgreSQL service.

1. Create a database.
2. Copy a TLS/SSL PostgreSQL connection string.
3. Use it as `DATABASE_URL`.
4. Apply the checked-in migration:

   ```bash
   npm run db:deploy
   npm run db:seed
   ```

The seed adds the original portfolio data only when the `main` content record does not exist; it does not overwrite later admin changes.

---

## 4. Connect scalable Cloudflare R2 storage

R2 replaces browser localStorage and data-URL files. It is object storage, so its capacity is independent of Vercel/serverless filesystems.

### Create bucket and credentials

1. Cloudflare Dashboard → **R2 Object Storage** → create a bucket, for example `umair-portfolio`.
2. Create an R2 S3 API token/key restricted to this one bucket with **Object Read & Write**. Never use a Cloudflare global API key.
3. Record Account ID, Access Key ID, Secret Access Key and bucket name.
4. In the bucket, add a public custom domain, e.g. `media.yourdomain.com`. Set `R2_PUBLIC_BASE_URL` to it without a trailing slash.

### Add required CORS policy

In the R2 bucket CORS settings, use the production/local origins that will actually run the site. Replace these example values:

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://your-project.vercel.app",
      "https://www.yourdomain.com"
    ],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["Content-Type"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

`ETag` is required by the browser to finish a multipart upload. For a preview deployment where you specifically test uploads, add that exact preview URL as another allowed origin.

### Capacity behaviour

- At or below 64 MB, the exact original upload dialog requests a signed R2 PUT URL and sends the file directly from the browser.
- Above 64 MB, it uses multipart R2 uploads with adaptive parts (minimum 8 MiB; maximum 10,000 parts).
- The app accepts an object size up to R2’s 5 TiB object limit. There is no former 2 MB file cap or ~5 MB browser storage quota.
- Storage is scalable, but not literally infinite: R2 plan/billing/account limits, R2’s object limit and the visitor’s network still apply. Configure Cloudflare billing alerts and lifecycle policies for large portfolio files.

---

## 5. Configure optional Resend email

1. Create a Resend account and API key.
2. Verify a sending domain in Resend.
3. Add:

```dotenv
RESEND_API_KEY=re_xxxxxxxxx
CONTACT_TO_EMAIL=engr.umair.ahmad111@gmail.com
CONTACT_FROM_EMAIL=Portfolio <hello@yourdomain.com>
```

A valid message is persisted in PostgreSQL. If Resend is configured it is also sent to `CONTACT_TO_EMAIL` with the visitor email as Reply-To.

---

## 6. Deploy on Vercel

1. Go to [Vercel](https://vercel.com/new) and import the GitHub repository.
2. Use Framework Preset **Next.js** and Node.js **20.x**.
3. In Vercel → Settings → Build and Deployment, set Build Command:

   ```bash
   npm run vercel-build
   ```

   It generates Prisma client code, safely applies committed migrations, then builds the site.

4. In Vercel → Settings → Environment Variables, add these for **Production**:

| Variable | Required value |
| --- | --- |
| `APP_URL` | final site URL, e.g. `https://www.yourdomain.com` |
| `AUTH_SECRET` | random value generated with `openssl rand -base64 48` |
| `ADMIN_PASSWORD_HASH` | bcrypt output created locally for the requested password |
| `DATABASE_URL` | managed PostgreSQL connection URL |
| `R2_ACCOUNT_ID` | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | bucket-scoped R2 access key |
| `R2_SECRET_ACCESS_KEY` | bucket-scoped R2 secret |
| `R2_BUCKET` | bucket name |
| `R2_PUBLIC_BASE_URL` | R2 public custom domain, no trailing slash |
| `RESEND_API_KEY` | Resend key, if email delivery is desired |
| `CONTACT_TO_EMAIL` | recipient inbox |
| `CONTACT_FROM_EMAIL` | verified Resend sender |
| `UPSTASH_REDIS_REST_URL` | recommended durable production rate-limit URL |
| `UPSTASH_REDIS_REST_TOKEN` | recommended durable production rate-limit token |

5. Deploy. If the production database was not already seeded, run `npm run db:seed` from a trusted machine with the production `DATABASE_URL` in its environment.
6. Add your custom domain in Vercel. Update both `APP_URL` and the R2 CORS origins if your final domain changes, then redeploy.

### Rate-limiting note

Create an Upstash Redis database and add its two variables for production. Without it, the application falls back to in-memory rate limits that are suitable only for local development, not independent Vercel functions.

---

## 7. Verify the full-stack deployment

### Original UI

- [ ] Open `/` in private/incognito mode.
- [ ] Compare it with the supplied original: navigation, layout, colors, responsive breakpoints, sections, admin button and all cards should be the same.
- [ ] Confirm the **Download Updated HTML** button no longer appears.

### Authentication and saving

- [ ] Open the existing lock button and log in with the configured password.
- [ ] In DevTools → Application, confirm the admin session cookie is `HttpOnly`, `Secure` in production and `SameSite=Strict`.
- [ ] Edit an existing element using the original admin controls, click the original **Save Portfolio** button, refresh in a second browser/private window, and confirm the change persisted.
- [ ] Log out using the original Exit Admin button.
- [ ] Submit five incorrect password attempts; subsequent attempts should return HTTP 429. Confirm Upstash is configured in production.

### Uploads

- [ ] Log in and use one of the original existing upload controls.
- [ ] Upload a small image/PDF and save portfolio changes.
- [ ] Refresh the public site. The asset URL should be under `https://media.yourdomain.com/portfolio/...`, not `data:` and not a Vercel upload URL.
- [ ] Upload a file larger than 64 MB. Progress updates should complete and the same original file preview/control should be shown.
- [ ] If multipart upload reports a missing ETag, correct R2 CORS `ExposeHeaders` to include `ETag` exactly.
- [ ] Verify Vercel logs only show small signed-URL API requests, never a file body.

### Contact form

- [ ] Submit a test from the unchanged original contact form.
- [ ] Verify it is in PostgreSQL `ContactMessage` and, if configured, delivered through Resend.

---

## 8. Single HTML version

`portfolio-static.html` is a self-contained copy of the supplied design with the broken Download button removed. It preserves the public UI exactly and can be opened locally or uploaded to static hosting.

It is deliberately **view-only for admin/upload functions**. A standalone HTML file cannot securely store a server password hash, sign cloud storage URLs, use PostgreSQL, or protect R2 credentials. Use the full-stack deployment for editing and secure uploads.

## 9. Security and operations

- Password plaintext is never committed; only a bcrypt hash belongs in the environment.
- R2 credential is bucket-scoped and server-only; direct browser upload URLs expire after five minutes.
- APIs validate origin, admin cookie, file type and request size before issuing uploads.
- Back up PostgreSQL and R2 separately.
- Set R2 lifecycle rules and billing alerts. UUID object keys mean old files are not auto-deleted after replacing an asset.
- For confidential files, create a separate private R2 bucket and signed-download flow. The configured media bucket is intentionally public because public portfolio assets need browser access.
