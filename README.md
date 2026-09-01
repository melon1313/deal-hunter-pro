# Deal Hunter Pro

建立"機票降價通知"的Saas服務

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ed58b189-0499-4b0b-af60-3b4fc9c02b55).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Deploying to Vercel

This project builds to Vercel's Build Output API v3 (a Nitro `vercel` preset,
Node.js serverless function) via a plain `npm run build` — no `vercel build`
step needed. When importing the repo in Vercel:

- Framework Preset: leave as detected or "Other" — `vercel.json` pins
  `framework: null` so Vercel trusts the build output directly instead of
  guessing from `vite.config.ts`.
- Build Command: `npm run build` (from `vercel.json`).
- Environment Variables — set these in the Vercel project settings (they are
  **not** committed to this repo):
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `LOVABLE_CRON_SECRET` / `LOVABLE_CRON_SECRET_PREVIOUS`
  - The public `VITE_SUPABASE_*` / `SUPABASE_*` values already in `.env` are
    committed since they are Supabase's publishable (anon) keys, not secrets.

To self-deploy elsewhere, override the preset in `vite.config.ts`
(`nitro.preset`), e.g. back to `cloudflare-module` for Cloudflare.

**Two lockfiles, on purpose:** `bun.lock` resolves several `@supabase/*` /
`@lovable.dev/*` packages against Lovable's private npm proxy
(`europe-west1-npm.pkg.dev`), which only the Lovable sandbox can reach — keep
it for the Lovable editor's own build. `package-lock.json` resolves the same
dependency tree against the public npm registry and is what `vercel.json`'s
`npm install` uses, so Vercel (or any external CI) isn't blocked by that
private registry.
