# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build (run to verify before committing)
npm run lint         # ESLint
npm run db:generate  # Generate Prisma client after schema changes
npm run db:migrate   # Run migrations (requires DATABASE_URL)
npm run db:seed      # Seed occasions + card templates (tsx prisma/seed.ts)
npm run db:studio    # Prisma Studio GUI
```

## Architecture

This is a Next.js 16 App Router application. All pages are Server Components by default; components that use hooks or browser APIs are marked `"use client"`.

**Request flow for the main user journey:**
1. `/cards` — Server Component fetches templates directly via `prisma` (no API call)
2. `/customize/[cardId]` — Server Component loads template + verses; passes to `CustomiseStudio` (client)
3. `CustomiseStudio` calls `POST /api/ai/generate-message` for streaming AI messages, then `router.push("/send?...")` with card data in query params
4. `/send` — Client Component reads query params, calls `POST /api/send/email` or `/api/send/whatsapp`
5. `/view/[token]` — Server Component renders the card publicly for recipients

**Auth:** `auth.ts` exports `{ handlers, auth, signIn, signOut }` from NextAuth v5 (beta). Server components call `auth()` directly. Client components use `useSession()` from `next-auth/react` wrapped by `SessionProvider` in the root layout. Session includes `user.id` via the session callback.

**Database:** Prisma 7 with `@prisma/adapter-pg`. The singleton is in `lib/db/prisma.ts` — it constructs `PrismaPg({ connectionString })` and passes it as `adapter` to `PrismaClient`. **Do not** put `url` in `prisma/schema.prisma` — it belongs only in `prisma.config.ts` (Prisma 7 breaking change).

**AI messages:** `lib/ai/claude.ts` exports `anthropic` (Anthropic SDK client) and `buildIslamicGreetingPrompt(params)`. The route `POST /api/ai/generate-message` streams `claude-sonnet-4-6` responses using `anthropic.messages.stream()`. Rate limiting is in-memory (resets on server restart). AI generation is gated to paid plans only.

**Feature gating:** All plan checks go through `lib/stripe/plans.ts` — `canSendCard()`, `canUseAI()`, `canSchedule()`, `canUsePremiumCards()`. Always check these before privileged operations.

**Stripe:** API version is `"2026-02-25.clover"`. Webhook handler at `/api/stripe/webhook` syncs `user.plan`, `subscriptionId`, and `subscriptionEnd` on `checkout.session.completed`, `subscription.updated`, and `subscription.deleted` events.

**Delivery:** Email via Resend (`lib/delivery/email.ts`). WhatsApp via `wa.me` share URL (`lib/delivery/whatsapp.ts`) — no Business API needed. Both send routes create a `SentCard` record first, then attempt delivery, then update `status`.

## Key Constraints

- **`params` and `searchParams` are async in Next.js 16** — always `await params` in page/route components.
- **Stripe API version** must be `"2026-02-25.clover" as const`.
- **Prisma schema** must not contain a `url` field on the datasource — the URL is in `prisma.config.ts`.
- The `user.id` is not on the NextAuth session type by default — it's added via the `session` callback in `auth.ts` and requires a type augmentation if TypeScript complains.

## Environment Variables

See `.env.local` for all required keys. The minimum to run locally:
- `DATABASE_URL` — PostgreSQL connection string
- `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` — NextAuth + Google OAuth
- `ANTHROPIC_API_KEY` — Claude API
- `RESEND_API_KEY` — Email delivery
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_MONTHLY_PRICE_ID`, `STRIPE_ANNUAL_PRICE_ID` — Payments
- `NEXT_PUBLIC_APP_URL` — Used to build card view URLs (e.g. `http://localhost:3000`)

## What's Not Yet Implemented

- Lottie animation files (`/public/animations/*.json`) and card background images (`/public/images/cards/`) — needed for the card renderer to show real visuals
- SMS delivery (`lib/delivery/sms.ts` — Twilio is installed but the module doesn't exist yet)
- Scheduled delivery (BullMQ + Upstash Redis — packages installed, workers not built)
- Arabic RTL UI (`next-intl` is installed, not wired up)
- `/sign-in` page (NextAuth redirects there but the page doesn't exist)
