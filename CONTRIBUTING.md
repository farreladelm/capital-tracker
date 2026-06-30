# Contributing to Capital Tracker

Welcome to Capital Tracker! This document provides instructions for developers looking to set up the project locally, run tests, and contribute.

## 1. Local Setup

First, ensure you have Node.js installed (v20+ recommended).

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   Copy `.env.example` to `.env` and fill out the necessary variables.
   ```bash
   cp .env.example .env
   ```
   *Note: For local development, `DATABASE_URL` will default to a local SQLite file (`file:./dev.db`). You will also need to generate a `GEMINI_API_KEY` from Google AI Studio.*

## 2. Database & Prisma

We use Prisma as our ORM, with Turso/LibSQL adapter configuration to ensure Edge compatibility on deployment platforms like Vercel.

**Generating the Prisma Client:**
Whenever you modify `prisma/schema.prisma`, you need to regenerate the Prisma client:
```bash
npx prisma generate
```

**Running Migrations locally (SQLite):**
```bash
npx prisma db push
```

*Note: For local development, we use a standard SQLite file. In production, we deploy using PostgreSQL or Turso with the driver adapter.*

## 3. Running the App

To start the Next.js development server:
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

## 4. Testing

We use Playwright for End-to-End testing.

**Run all tests:**
```bash
npx playwright test
```

**Run tests in UI mode (for debugging):**
```bash
npx playwright test --ui
```

Make sure the app builds properly before running E2E tests, or rely on the Playwright `webServer` configuration to boot up the dev server automatically.

## 5. Agent Instructions

If you are an AI agent working on this codebase:
- Always prefix shell/terminal commands with `rtk` (e.g. `rtk npm run dev`).
- Always run the tests before declaring a feature complete.
- Follow the playful, consumer-app design aesthetic detailed in the `SPEC.md`.
