# Architecture: Capital Tracker

## 1. Tech Stack
- **Frontend Framework:** Next.js (App Router), React
- **Styling & Components:** Tailwind CSS v4, supplemented with Vanilla CSS for complex micro-animations. Shadcn UI can be used for complex component interactions (e.g., dialogs, dropdowns), but its default Tailwind classes must be heavily modified to match the playful aesthetic defined in `DESIGN.md`.
- **Backend:** Next.js API Routes (API-first architecture).
- **Database:** Prisma ORM, SQLite (development) migrating to PostgreSQL (production).
- **Authentication:** Auth.js (NextAuth.js) using Prisma Adapter. Supports Google OAuth and Credentials (email/password with bcrypt hashing).
- **AI Processing:** Google Gen AI SDK (Gemini API) utilizing structured JSON output mode.

## 2. Database Engine & Migration Plan
- **Engine:** SQLite for local development to ensure zero-setup friction.
- **Migration to Prod:** When deploying to production (e.g., Vercel or Railway), the Prisma schema will be swapped to use a `postgresql` provider and migrated using standard `prisma migrate deploy` workflows.

## 3. Service Abstractions
- **AI Parser Service:** The natural language parsing logic must be wrapped in an abstract service interface (e.g., `parseTransaction(input: string)`). The API route controller must not know about Google Gemini directly. This allows swapping the provider (e.g., to OpenAI) in the future without touching API routes.
- **Data Access Layer:** API routes interact with the database via dedicated repository functions (e.g., `createTransaction`, `getDashboardAggregates`), keeping Prisma logic out of the route handlers.

## 4. Error Handling & Retry Strategy
- **AI Provider Failures:**
  - If the Gemini API fails, times out, or returns invalid JSON, the service will retry exactly once.
  - If the second attempt fails, the API returns a `503 Service Unavailable` with error code `AI_PROVIDER_FAILURE`.
  - The frontend catches this error and gracefully falls back to displaying a manual entry form (Amount, Category dropdown, Description).
- **Input Validation:** Zod will be used to strictly validate all incoming requests to API routes. Invalid requests return `400 Bad Request` with `VALIDATION_FAILED`.

## 5. Rate Limiting
- **Implementation:** Implement strict rate limiting on the `/api/transactions/parse` endpoint to prevent abuse and runaway API costs.
- **Limits:** 10 requests per minute per authenticated user. Returns `429 Too Many Requests`.

## 6. Testing Strategy
- **Unit Tests (Jest):**
  - High coverage required for the AI Parser Service logic. Tests must *mock* the Gemini API response to ensure our abstraction handles success/failure shapes correctly without hitting the live API.
  - High coverage for data access functions and complex UI state.
- **End-to-End Tests (Playwright):**
  - E2E tests will run against a fully built app connected to a test database.
  - Required flows: User login, navigating to dashboard, submitting a transaction via text input, and verifying the pie chart updates correctly.
