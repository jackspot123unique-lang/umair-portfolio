# Upload this complete project to GitHub without VS Code

You do not need VS Code or any coding software.

1. Extract the ZIP on your phone or computer.
2. Open your existing GitHub repository in a web browser.
3. Choose **Add file** → **Upload files**.
4. Upload the **contents** of the `Portfolio Engr Umair Ahmad` folder. Do not upload the outer ZIP file itself.
5. Keep the existing `.env.local` and all Vercel Environment Variables unchanged. This ZIP intentionally does not contain secrets.
6. Commit the upload to the `main` branch. Vercel will deploy automatically.

Important folders/files in this upload include:

- `app/api/file-preview/route.ts` — mobile/desktop PDF preview API
- `public/portfolio-ui.html` — portfolio UI
- `public/portfolio-tools.js` and `public/pdf.worker.mjs` — PDF mobile viewer
- `client-portfolio-tools.ts` and `scripts/build-portfolio-tools.mjs` — Vercel build sources
- `package.json` and `package-lock.json` — required PDF preview dependencies

Do not upload `node_modules`, `.next`, `.env.local`, or any secret files.
