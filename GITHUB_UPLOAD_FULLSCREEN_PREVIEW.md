# Upload this complete project to GitHub without VS Code

Use this complete ZIP instead of older individual update ZIP files.

## Before upload

- Do **not** delete any existing GitHub source files manually.
- Do **not** upload `.env.local`, `node_modules`, `.next`, or secrets.
- Keep your existing Vercel environment variables, including `R2_PUBLIC_BASE_URL`.

## Browser-only upload

1. Extract the ZIP.
2. Open the existing GitHub repository and the `main` branch.
3. Select **Add file** → **Upload files**.
4. Upload the contents inside the `Portfolio Engr Umair Ahmad` folder.
5. Files with the same path replace the older version when committed.
6. Commit to `main`. Vercel deploys automatically.

Important files included in this complete project:

- `public/portfolio-ui.html`
- `public/portfolio-tools.js`
- `public/pdf.worker.mjs`
- `client-portfolio-tools.ts`
- `scripts/build-portfolio-tools.mjs`
- `app/api/file-preview/route.ts`
- `package.json`
- `package-lock.json`

The three old portfolio PDF export buttons are removed by the updated `public/portfolio-ui.html`.
