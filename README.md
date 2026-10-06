# AI Budget Travel Planner

A full-stack travel planning app that picks a destination based on what you can actually afford, builds a real day-by-day itinerary for it, and lets you discover and save local recommendations for any city.

**Live app:** https://ai-travel-planner-aldi8.vercel.app

---

## What it does

**Budget Travel Planner** — set a budget split across flights, stay, food, and activities. An AI pipeline proposes candidate destinations, checks them against real flight and hotel prices, picks the one that actually fits, and builds a full itinerary within what's left of the budget. The whole process streams live to the UI as it runs.

**Explore** — search any city and get tourist areas, landmarks, nature spots, and local food recommendations, plus a practical "getting around" guide. Save places you want to remember to a personal list.

---

## Why this is more than a form-over-API wrapper

A few decisions worth calling out, since they're the actual engineering substance behind this project:

### Every external data source sits behind a swappable interface

Flights, hotels, places, and the AI layer are each defined as a small interface (`FlightProvider`, `HotelProvider`, `PlaceProvider`, `AiPlanner`) with a fake implementation built first and a real one plugged in after. This meant the entire pipeline — orchestration, streaming, persistence, UI — could be built and tested end to end before a single paid API key existed, and switching a provider later never requires touching the orchestrator.

### The pipeline is a real multi-step process, not one AI call

`planTrip.ts` runs: generate candidate destinations → price them in parallel against real providers → filter to what actually fits the budget → have the AI pick the best of the fitting options (skipped automatically when only one fits) → find real places → build an itinerary → persist everything in one transaction. Budget-fit math is done in plain TypeScript, never by the AI — a model is good at reasoning about trade-offs, not reliable at arithmetic.

### Streaming is NDJSON over a `POST`, not SSE

The planning endpoint needs to accept a request body, which rules out `EventSource`-based Server-Sent Events (`GET`-only). Instead, `POST /api/trips` streams newline-delimited JSON events directly in the response body, and the client reads it with `fetch` + `ReadableStream`, parsing one `PlanEvent` per line as it arrives.

### The AI has an automatic fallback chain, with real retry logic

Every structured AI call goes through one function that: asks Gemini, retries once on a failed schema validation (feeding the validation error back into the prompt), retries again on transient `429`/`5xx` errors with backoff — and only if all of that is exhausted, falls back to Groq automatically and repeats the same validation/retry logic there. In production, this already recovered automatically from a real Gemini quota exhaustion without the user-facing request failing.

### The app doesn't let AI invent confidence it doesn't have

This shows up throughout, deliberately:

- AI prompts ask for _relative_ cost language ("inexpensive," "pricier than X"), never fabricated exact prices
- Food recommendations get a general neighborhood, never an invented street address
- The boarding-pass/hotel-voucher UI only displays fields that actually exist in the database — no flight numbers or cabin classes were added just because a design reference showed them
- Fake provider data is explicitly understood as a stand-in during development, never silently presented as real

### Explore results are cached, not re-fetched every search

Each city/category combination is cached for 7 days in Postgres. A second search for the same city returns near-instantly with zero external API calls — this is also what keeps the free-tier Geoapify/Gemini usage sustainable under real traffic.

---

## Tech stack

- **Framework:** Next.js 16 (App Router), TypeScript
- **Database:** PostgreSQL (Neon in production) via Prisma
- **Auth:** Better Auth (email/password + Google OAuth)
- **AI:** Gemini (primary) with an automatic Groq fallback, structured JSON output validated with Zod
- **Data sources:** Geoapify (places), with a provider-interface architecture ready for real flight/hotel APIs
- **Styling:** Tailwind CSS v4, a custom "travel document" design system (see below)
- **Testing:** Vitest, covering budget math, AI response validation, and the orchestration pipeline against fake dependencies
- **Deployment:** Vercel

---

## Design system

A visual language grounded in real travel ephemera — boarding passes, luggage tags, ticket stubs — rather than generic travel-app iconography. Sharp-cornered cards with hard ink-offset shadows, a perforated-divider motif reserved specifically for genuinely sequential content (itinerary days, budget rows), and a restrained palette where every color has exactly one meaning throughout the app (for example, the accent red is used _only_ for errors and over-budget states, never as a generic "primary" color).

---

## Project structure

```
src/
├── app/
│   ├── api/                 # Route handlers: auth, trips, explore, saved-places, locations
│   ├── (app)/                # Authenticated pages: plan, trips, explore, saved
│   └── login/                 # Auth page
├── components/               # UI components, grouped by feature
├── lib/
│   ├── pipeline/              # planTrip.ts orchestrator + supporting steps
│   ├── ai/                    # LLM wrapper (Gemini + Groq fallback), schemas, prompts
│   ├── providers/              # Flight/hotel provider interfaces + fake implementations
│   ├── explore/                # Geoapify client + Explore-specific AI categories
│   ├── auth.ts, db.ts            # Better Auth + Prisma singletons
│   └── budget.ts                # Pure budget-fit math, fully unit tested
└── generated/prisma/            # Generated Prisma client
prisma/
├── schema.prisma
└── migrations/
tests/                            # Vitest: budget math, AI validation, pipeline integration
```

---

## Running locally

```bash
git clone <repo-url>
cd ai-travel-planner
npm install
```

Create `.env` with:

```
DATABASE_URL=                    # local PostgreSQL connection string
BETTER_AUTH_SECRET=              # random string, e.g. openssl rand -base64 32
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.8-flash
GROQ_API_KEY=                    # optional -- enables the automatic fallback
GROQ_MODEL=openai/gpt-oss-120b
GEOAPIFY_API_KEY=
USE_FAKE_AI=false
USE_FAKE_PROVIDERS=true          # flights/hotels still run on fake data -- see Known limitations
USE_FAKE_PLACES=true
```

```bash
npx prisma migrate dev
npm run dev
```

```bash
npm run test     # unit + pipeline tests
npm run build    # production build check
```

---

## Known limitations

Documented honestly rather than hidden:

- **Flight and hotel pricing is still fake data.** Real Google Places API pricing changed dramatically in 2026 (entry tier now ~$275/month), so the trip planner currently runs on a deterministic fake provider behind the same interface a real one would use. Swapping in a real provider (e.g. Travelpayouts/Makcorps) touches only `lib/providers/`, nothing else.
- **Rate limiting is in-memory**, not shared across serverless instances — a reasonable guard for a single-deploy portfolio project, not production-grade at scale.
- **The trip-planning endpoint is capped at Vercel's 60-second Hobby-plan function limit.** A worst-case run with multiple AI retries across several calls could still exceed it; this surfaces as a clean timeout, not a crash.
- A handful of pipeline edge cases from the original test plan (AI returning invalid output twice in a row, a mid-run provider failure) aren't covered by the current test suite yet.

---

## Author

Aldi Putra — [portfolio](https://aldi-putra.vercel.app)
