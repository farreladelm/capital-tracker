# Aura Finance (Capital Tracker)

A serene, Apple Health-inspired personal finance tracker designed to make logging and reviewing expenses frictionless. Built with a "Minimalist Calm" aesthetic, it prioritizes typography, layout breathability, and ease of use over dense grids and complicated forms.

---

## 🚀 Key Features

* **Natural Language Transaction Logging (NLP):** Log transactions instantly by typing or saying a simple sentence (e.g., *"Lunch $15"* or *"Salary $3500"*). Powered by the **Google Gen AI SDK (Gemini API)** with structured JSON outputs.
* **Auto-Fallback Manual Logging:** In the event of AI service timeouts or limits, the app seamlessly transitions to a structured manual entry form without disrupting the user flow.
* **Tonal-Layer Design System:** A custom styling system built on soft gradients, squircle containers (16px/24px rounded corners), and ambient shadows rather than harsh borders. Accessible under standard WCAG AA contrast ratios.
* **Dynamic Multi-Currency & Locale Support:** Supports multiple currencies with automated locale-aware formatting, including compact formatting for high-value currencies (such as Indonesian Rupiah - IDR) to prevent screen layout breaking.
* **3-State Budget Tracking:** Category budgets automatically monitor monthly caps and provide visual warnings (under 70%, 70-100%, and over-budget) with custom warning/error indicator systems.
* **Secure Authentication:** Built on **Auth.js (NextAuth.js v5)**, supporting both Google OAuth and email/password credentials secured with bcrypt hashing.
* **Dynamic Host Detection:** Configured for local and reverse-proxy deployment (e.g. ngrok tunnels), dynamically resolving callback URLs based on headers for seamless testing.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, Next.js 16 (App Router), Tailwind CSS v4, Vanilla CSS (Micro-animations) |
| **Backend & APIs** | Next.js API Route Handlers (Zod schema validation, API-first architecture) |
| **AI Integration** | Google Gen AI SDK (Gemini API - Structured JSON Output Mode) |
| **Database & ORM** | Prisma ORM, SQLite (local development), PostgreSQL (production-ready) |
| **Authentication** | Auth.js (NextAuth.js v5) with Prisma adapter |
| **Testing** | Vitest (Unit & Integration tests), Playwright (E2E Browser testing) |

---

## 🏛️ Architectural Highlights

1. **Service-Oriented Abstraction:** Business logic, third-party integrations (Gemini API), and database operations are fully decoupled from API routes and extracted into service classes under [`lib/services/`](file:///home/milo/personal-project/capital-tracker/lib/services/) (e.g., `AIParserService`, `TransactionService`). API routes handle HTTP concern serialization, Zod validation, and status codes.
2. **Robust Database Isolation:** Direct Prisma queries are kept out of routes and views, encapsulating data operations within a clean repository layer.
3. **Resilient Error Boundaries:** Incorporates structured error handling and a 1-retry backoff strategy on external AI provider failures, falling back gracefully to client forms.
4. **Rate Limiting:** Protects the AI parsing endpoints to prevent abuse and runaway API costs.

---

## 💻 Getting Started

### Prerequisites
* Node.js (v20+ recommended)
* npm, pnpm, or bun

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/farreladelm/capital-tracker.git
cd capital-tracker
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory and define the following variables:
```env
DATABASE_URL="file:./dev.db"

AUTH_SECRET="your-auth-secret-key"
AUTH_TRUST_HOST="true"

# Google OAuth Credentials
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Gemini API Key
GEMINI_API_KEY="your-gemini-api-key"
```

### 3. Database Initialization
Initialize SQLite and run the migrations:
```bash
npx prisma db push
```

### 4. Running the Development Server
Start the Next.js dev server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🧪 Testing

### Unit & Service Layer Tests
Unit tests cover business logic, service boundaries, and edge cases, isolated from Playwright E2E configuration to prevent compilation conflicts.
```bash
npm run test:unit
```

### End-to-End Tests
E2E browser tests are built with Playwright to validate user authentication, natural language logs, dashboard graphs, and budget updates.
```bash
npx playwright test
```
