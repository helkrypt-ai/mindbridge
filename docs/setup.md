# MindBridge — Technical Setup Guide

This guide covers deploying MindBridge from scratch: environment variables, Supabase schema, Vercel deployment, and Stripe webhook configuration.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Environment Variables](#2-environment-variables)
3. [Supabase Setup](#3-supabase-setup)
4. [Vercel Deployment](#4-vercel-deployment)
5. [Stripe Configuration](#5-stripe-configuration)
6. [OpenAI Configuration](#6-openai-configuration)
7. [Resend (CTO Digest Email)](#7-resend-cto-digest-email)
8. [Local Development](#8-local-development)
9. [Vercel Cron Jobs](#9-vercel-cron-jobs)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | ≥ 18 | Runtime |
| npm | ≥ 9 | Package manager |
| Git | any | Source control |
| Supabase account | — | Database + Auth |
| Vercel account | — | Hosting |
| Stripe account | — | Payments |
| OpenAI account | — | AI features |
| Resend account | — | Email delivery |

---

## 2. Environment Variables

Copy `.env.example` to `.env.local` for local development, or set these in Vercel's project settings for production.

```env
# ── Supabase ──────────────────────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...                    # Safe to expose to browser
SUPABASE_SERVICE_ROLE_KEY=eyJ...                         # Server-side only — never expose

# ── OpenAI ────────────────────────────────────────────────────────────────────
OPENAI_API_KEY=sk-...                                    # AI chat + journal reflection

# ── Stripe ────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...           # Safe to expose to browser
STRIPE_SECRET_KEY=sk_live_...                            # Server-side only
STRIPE_WEBHOOK_SECRET=whsec_...                          # Set after step 5 below
STRIPE_PREMIUM_PRICE_ID=price_...                        # From Stripe Dashboard > Products

# ── Resend ────────────────────────────────────────────────────────────────────
RESEND_API_KEY=re_...
CTO_DIGEST_EMAIL=cto@yourdomain.com                      # Receives daily feedback digest
```

> **Security:** `SUPABASE_SERVICE_ROLE_KEY` and `STRIPE_SECRET_KEY` bypass Row Level Security / payment controls. Never commit these or expose them to the browser.

---

## 3. Supabase Setup

### 3.1 Create a project

1. Log in to [supabase.com](https://supabase.com) and create a new project
2. Note your **Project URL** and **anon key** (Settings → API)
3. Get the **service role key** (Settings → API → `service_role` — keep this secret)

### 3.2 Apply migrations

The full schema is in `supabase/migrations/`. Apply in order:

**Option A — Supabase CLI (recommended)**
```bash
npx supabase login
npx supabase link --project-ref your-project-id
npx supabase db push
```

**Option B — SQL Editor**
1. Open **SQL Editor** in the Supabase Dashboard
2. Paste and run `supabase/migrations/001_initial.sql`
3. Then paste and run `supabase/migrations/002_user_feedback.sql`

### 3.3 Tables created

| Table | Purpose |
|-------|---------|
| `profiles` | User name, goals, primary concern |
| `mood_entries` | Daily check-in scores and notes |
| `journal_entries` | Journal text + AI reflection prompts |
| `chat_sessions` | Chat session metadata |
| `messages` | Individual chat messages (user + assistant) |
| `subscriptions` | Stripe subscription status |
| `user_feedback` | In-app star ratings and comments |

All tables have Row Level Security (RLS) enabled — users can only read/write their own rows.

### 3.4 Enable Google OAuth (optional)

1. Go to Supabase Dashboard → **Authentication → Providers → Google**
2. Enable Google provider
3. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com)
4. Add your Vercel domain to the authorised redirect URIs:
   `https://your-app.vercel.app/auth/callback`
5. Paste the Client ID and Secret into Supabase

### 3.5 Migrate from an existing project

If the Supabase project was previously used for another app, drop all existing tables before applying MindBridge migrations:

```sql
-- Run in Supabase SQL Editor
DO $$ DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
    EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
  END LOOP;
END $$;
```

Then apply migrations from step 3.2.

---

## 4. Vercel Deployment

### 4.1 Import the project

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import from GitHub: `helkrypt-ai/mindbridge`
3. Framework preset: **Next.js** (auto-detected)

### 4.2 Add environment variables

In the Vercel project settings → **Environment Variables**, add every variable from section 2. Set them for **Production**, **Preview**, and **Development** as appropriate.

> Add `STRIPE_WEBHOOK_SECRET` after completing step 5 (Stripe webhook setup).

### 4.3 Deploy

Click **Deploy**. Vercel will build and publish the app. Note the production URL (e.g. `https://mindbridge-indol.vercel.app`).

### 4.4 Configure Supabase auth redirect

1. In Supabase Dashboard → **Authentication → URL Configuration**
2. Set **Site URL** to your Vercel production URL
3. Add to **Redirect URLs**: `https://your-app.vercel.app/auth/callback`

---

## 5. Stripe Configuration

### 5.1 Create a product and price

1. Log in to [stripe.com](https://stripe.com) → **Dashboard**
2. Go to **Products → Add product**
3. Name: `MindBridge Premium`
4. Add a price: **$9.99 / month** (recurring)
5. Copy the **Price ID** (starts with `price_`) → set as `STRIPE_PREMIUM_PRICE_ID`

### 5.2 Register the webhook endpoint

1. In Stripe Dashboard → **Developers → Webhooks → Add endpoint**
2. Endpoint URL: `https://your-app.vercel.app/api/stripe/webhook`
3. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Click **Add endpoint**
5. Reveal and copy the **Signing secret** (starts with `whsec_`)
6. Add it to Vercel as `STRIPE_WEBHOOK_SECRET` and redeploy

### 5.3 Test payments

Use Stripe test mode and test card `4242 4242 4242 4242` (any future expiry, any CVC) to verify the checkout flow before going live.

---

## 6. OpenAI Configuration

1. Get an API key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Add it to Vercel as `OPENAI_API_KEY`

The app uses **GPT-4o-mini** for both the AI chat companion and journal reflection prompts. If `OPENAI_API_KEY` is missing or set to the placeholder value, these features degrade gracefully — chat returns a static fallback message and journal saves a generic reflection prompt.

**Cost estimate:** GPT-4o-mini at ~$0.15/M input tokens + $0.60/M output tokens. A typical chat session (10 turns, ~500 tokens each) costs approximately $0.001.

---

## 7. Resend (CTO Digest Email)

The daily CTO digest is a Vercel cron job that runs at **08:00 UTC** and emails a summary of the previous 24 hours of user feedback.

1. Create a free account at [resend.com](https://resend.com)
2. Create an API key → set as `RESEND_API_KEY`
3. Verify your sending domain in Resend (or use the `onboarding@resend.dev` sandbox for testing)
4. Set `CTO_DIGEST_EMAIL` to the recipient address

The cron schedule is defined in `vercel.json`:
```json
{
  "crons": [{ "path": "/api/cron/digest", "schedule": "0 8 * * *" }]
}
```

Vercel cron jobs require a **Pro plan** or higher. On the free Hobby plan, the cron will not execute automatically — trigger it manually at `/api/cron/digest` for testing.

---

## 8. Local Development

```bash
# 1. Clone the repo
git clone https://github.com/helkrypt-ai/mindbridge.git
cd mindbridge

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# 4. Run the dev server
npm run dev
# App runs at http://localhost:3000
```

For local Stripe webhook testing, install the [Stripe CLI](https://stripe.com/docs/stripe-cli) and forward events:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
# Copy the webhook signing secret printed by the CLI into STRIPE_WEBHOOK_SECRET
```

---

## 9. Vercel Cron Jobs

The `vercel.json` at the repo root configures scheduled jobs:

```json
{
  "crons": [
    { "path": "/api/cron/digest", "schedule": "0 8 * * *" }
  ]
}
```

| Job | Schedule | Endpoint | Purpose |
|-----|----------|----------|---------|
| CTO feedback digest | Daily 08:00 UTC | `/api/cron/digest` | Aggregates last 24h of user feedback and emails summary |

To add new cron jobs, extend `vercel.json` and create the corresponding route handler under `app/api/cron/`.

---

## 10. Troubleshooting

### AI chat shows "requires an OpenAI API key"
Set `OPENAI_API_KEY` in your environment. The value must not equal `"placeholder"`.

### Stripe checkout returns 503
`STRIPE_PREMIUM_PRICE_ID` is missing or set to `"price_placeholder"`. Create a product/price in Stripe Dashboard and set the real Price ID.

### Stripe webhook returns 400 "Invalid signature"
`STRIPE_WEBHOOK_SECRET` does not match the signing secret for the registered endpoint. Re-copy the secret from Stripe Dashboard → Developers → Webhooks → your endpoint → Signing secret.

### Google OAuth fails / redirect loop
Ensure both the Supabase **Site URL** and **Redirect URL** (`/auth/callback`) match your exact Vercel production domain (including `https://`). Also confirm the same redirect URI is registered in Google Cloud Console.

### Supabase queries return "new row violates row-level security"
The request is being made with the anon key but the RLS policy requires authentication. Ensure `createClient()` from `@/lib/supabase/server` is used in server routes, not the browser client.

### Cron digest not firing
Vercel cron jobs require a **Pro plan**. On Hobby, trigger manually: `GET /api/cron/digest` (from a server context or `curl` with appropriate headers).

---

*Last updated: April 2026 · For questions, open an issue at [github.com/helkrypt-ai/mindbridge](https://github.com/helkrypt-ai/mindbridge)*
