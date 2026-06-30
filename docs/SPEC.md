# Capital Tracker Specification

## 1. Overview
A frictionless, mobile-first web application designed to track expenses using natural language processing. The app is playful, and distinct from traditional "accountant" financial dashboards, looking and feeling much more like a friendly consumer app. It emphasizes zero-friction data entry above all else.

## 2. Goals & Non-goals
**Goals:**
- Lightning-fast expense and income logging.
- Simple, instantly understandable visual analytics (donut chart and net totals).
- Mobile-first, thumb-friendly user experience.

- Currency Support: Users choose their permanent base currency (e.g., USD, EUR, JPY) during onboarding. The app operates exclusively in this chosen currency.

**Non-goals (for v1):**
- Budget planning and strict limits.
- Investment or net-worth tracking.
- Bank account synchronization (Plaid, etc.).
- Shared or multi-user wallets.
- Multi-currency tracking (logging transactions in multiple different currencies).

## 3. Features
- **Frictionless Data Entry:** Users log expenses and income via a single chat-like input (e.g., "coffee 4$" or "got paid 500 for freelance").
- **AI-Powered Parsing:** Natural language extraction of amount, category, date, and type.
- **Instant Insights:** A dynamic donut chart for expenses, and a dashboard showing net totals that update instantly.
- **Smart Error Handling:** If critical info (like amount) is missing, the input shakes and prompts the user.
- **Multi-device Authentication:** Users can log in using Google OAuth or traditional Email/Password.
- **Data Isolation:** All data is strictly scoped to the authenticated user.

## 4. User Flows

### Onboarding & Authentication
1. User navigates to the app and sees a clean login screen (Sign in with Google or Email/Password).
2. *Edge Cases:* Forgot password triggers a reset email link. Email verification is required for non-OAuth signups. Linking an existing email/password account with Google OAuth is handled automatically if the email matches.
3. Upon first login, the user is presented with a required onboarding screen to choose their permanent base currency from a predefined list (e.g., USD, EUR, JPY, GBP).
4. Once the currency is selected, it is locked to their profile, and default categories (Food, Transport, Utilities, Fun, Salary) are provisioned.

### Logging a Transaction
1. Authenticated user views the dashboard.
2. User types: "Bought a pizza for $15 yesterday".
3. AI processes the input, extracting amount (1500 cents), category (Food), type (EXPENSE), and date (yesterday's date in UTC).
4. Transaction is saved. UI updates instantly.

### Correcting / Managing Transactions
- **Editing:** Users can edit the amount, description, date, type, and category of any transaction by tapping it in the history list.
- **Deletion:** Users can hard-delete a transaction. No undo window in v1.

### Category Management
- Users can create custom categories.
- **Category Deletion:** Blocked if transactions are attached. The user must reassign existing transactions before deleting the category.

## 5. Dashboard Definition
The dashboard consists of the following widgets (top to bottom):
1. **Header:** Current Period Toggle (Weekly / Monthly).
2. **Net Total:** Large text showing "Income - Expenses" for the selected period.
3. **Donut Chart:** Visual breakdown of Expenses by category (Income is excluded from the pie chart).
4. **Largest Category:** A small callout (e.g., "Highest spend: Food ($45)").
5. **The Input:** The chat-like "Magic Box" anchored to the screen.
6. **Recent Transactions:** Infinite scroll (cursor-based pagination) list of transactions.

## 6. Data Model (Conceptual)

**User**
- ID, Email, PasswordHash, Name, Image, EmailVerified
- Currency: String (e.g., 'USD', 'JPY'. Chosen once at onboarding and cannot be changed).

**Category**
- ID, UserID
- Name, Icon, Color
- Type: `INCOME` | `EXPENSE` (Used only for UI grouping/defaults)

**Transaction**
- ID, UserID, CategoryID
- Type: `INCOME` | `EXPENSE` (Source of truth. Must match Category type, validated on write).
- AmountMinor: Integer (e.g., 1500 for $15.00, or 1500 for ¥1500 depending on the currency's minor unit definition).
- Description: String
- Date: DateTime (Stored in UTC, displayed in user-local time)

## 7. AI Parsing Rules

| Input | Resolution Rule |
|---|---|
| `pizza 20 yesterday` | Parses relative date ("yesterday") based on the server's UTC timestamp of the request. Supports up to 7 days back. |
| `coffee` | Hard error (MISSING_AMOUNT). Triggers UI shake animation and prompt. |
| `lunch 20 and coffee 5` | Auto-splits into two distinct transactions. Returns an array of transactions to be saved. |
| `paid electricity 20` | If confidence > 80%, auto-assigns category. Otherwise, assigns to "Uncategorized" and flags for user review in the UI. |
| Missing/Implied Data | The parser must **never** invent an amount or date that wasn't present or clearly implied. |
| Fallback | If the AI provider times out or fails, the UI falls back to a standard manual entry form (Amount, Description, Category dropdown). |

## 8. API Contract (Endpoints)

All endpoints require a valid session token and validate that the resource belongs to the requesting `userId`.

- `POST /api/transactions/parse`: Submits natural language string, returns parsed transaction(s). Rate-limited (e.g., 10 per minute per user).
- `GET /api/transactions`: Returns transaction history. Supports cursor-based pagination and filtering by month, year, type, and category.
- `POST /api/transactions`: Manual creation bypass (used by the AI fallback form).
- `PATCH /api/transactions/:id`: Edit any field of a transaction.
- `DELETE /api/transactions/:id`: Hard delete a transaction.
- `GET /api/dashboard`: Returns pre-computed server-side aggregates (net total, category sums) for the requested period.
- `GET /api/categories`: List user's categories.
- `POST /api/categories`: Create custom category.
- `PATCH /api/categories/:id`: Edit category.
- `DELETE /api/categories/:id`: Hard delete (fails if transactions exist).

**Error States:**
- `MISSING_AMOUNT`, `UNPARSEABLE_INPUT`, `AI_PROVIDER_FAILURE`, `VALIDATION_FAILED`, `UNAUTHORIZED`, `RATE_LIMIT_EXCEEDED`.

## 9. Non-Functional Requirements
- **Performance:** Dashboard Initial Load < 500ms. AI Parsing response < 2000ms.
- **Availability:** Core manual entry must remain available if the AI provider goes down.
- **Security:** Strict authorization on all endpoints. Transaction IDs are UUIDs (non-enumerable). Rate limiting strictly applied to AI endpoints.
- **Constraints:** Max 50 custom categories per user. Input string limited to 255 characters.
