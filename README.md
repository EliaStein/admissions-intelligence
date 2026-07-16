# Admissions Intelligence

> **A portfolio project by [Eli Stein](https://www.linkedin.com/in/eli-stein-37570585/)** — product, full-stack build, and AI pipeline, end to end.

AI-powered feedback on college application essays, trained by former admission officers. Students submit a personal statement or supplemental essay, spend a credit, and receive detailed feedback by email.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4**
- **Supabase** — auth, Postgres, row-level security
- **OpenAI** — feedback generation
- **Stripe** — credit purchases (checkout + webhooks)
- **SendGrid** — feedback delivery email
- **Viral Loops** — referral rewards
- Deployed on **Netlify**

## Getting started

Requires Node ≥ 18.18.

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env.local` with the required variables (see [Environment](#environment)).
3. Start the dev server:
   ```bash
   npm run dev
   ```
   The app runs on `http://localhost:3000`.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint (flat config) |
| `npm test` | Run the Vitest suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run stripe:dev` | Forward Stripe webhooks to the local server |
| `npm run stripe:emit` | Emit a test `checkout.session.completed` event |

## Environment

Set these in `.env.local` (and in the Netlify dashboard for deploys):

| Variable | Purpose |
| --- | --- |
| `VIRAL_LOOPS_API_TOKEN` | Viral Loops referral campaign API |
| `OPENAI_API_KEY` | Essay feedback generation |
| `SENDGRID_API_KEY` | Feedback delivery email |

Supabase keys and Stripe secrets are read at runtime from the `config` table via the service role (see `src/services/configService.ts`).

## Architecture

```
src/
  app/             Next.js App Router pages + API route handlers
    api/           essays, stripe, admin, auth
  components/      UI components (client) + admin views
  hooks/           React hooks (auth, credits, schools)
  lib/             server helpers (admin client, api auth, admin guard)
  services/        business logic (credits, essays, AI, email, referrals)
  prompts/         OpenAI prompt templates
  config/          product/credit package config
  types/           domain + generated Supabase types
supabase/
  migrations/      database schema, RLS policies, credit RPCs
```

Key invariants:
- API routes derive the user from a **verified Supabase token**, never the request body.
- Credit balance changes go through **atomic RPCs** (`consume_user_credits` / `add_user_credits`) and are recorded in the `credit_transactions` ledger.
- Stripe webhooks are **signature-verified and idempotent**; credits are derived from the server-side package list, never client metadata.

## Testing

Unit and route tests run on [Vitest](https://vitest.dev):

```bash
npm test
```

Coverage focuses on the money and auth paths: credit service, referral rewards, essay submission (auth + ownership + duplicate handling), admin input validation, and the CSV/search escaping helpers.

## Contributing

Internal project. Contact the admin before opening a PR.
