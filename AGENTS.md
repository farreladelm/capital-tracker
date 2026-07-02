<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Shell Command Execution
- **Rule**: Always prefix any shell/terminal command with `rtk`.
- **Example**: `rtk git push ...`, `rtk git status`, `rtk npm run dev`.
- **Rationale**: `rtk` is used to save tokens. It trims down unnecessary shell command output before it is sent to the agent.

## Testing & Quality
- **Rule**: ALWAYS test everything that we build.
- **Details**: E2E tests must be written for all core user flows. Unit tests must cover all logic and edge cases. Never mark a feature as complete until tests are written and passing.

## Frontend Component Design
- **Rule**: Always design frontend UIs modularly by breaking complex interfaces down into smaller, single-purpose components.
- **Rule**: If a component is reused across multiple pages (e.g., layout headers, navigation elements, or global dialogs/modals), it MUST be extracted into a dedicated, self-contained component file (typically under `app/components/`).
- **Rationale**: Keeps pages clean, decoupled, and easy to maintain while ensuring layout consistency across different views.

## Design Context
- **Register**: `product` (design serves usability and transaction logging workflow).
- **Core Audience**: Busy personal finance users logging daily expenses via quick text/voice NLP.
- **Brand Personality**: Serene (Apple Health style), Precise (Manrope geometry), Approachable (financial wellness).
- **Anti-References**: Avoid neon dark mode SaaS visual clichés, gray-on-gray low-contrast text, nested cards, and heavy multi-input forms.
- **References**: Always follow the specifications in [PRODUCT.md](file:///home/milo/personal-project/capital-tracker/PRODUCT.md) and [docs/DESIGN.md](file:///home/milo/personal-project/capital-tracker/docs/DESIGN.md).

## Test Suite Runner Isolation
- **Rule**: Separate browser E2E tests from unit tests. E2E browser tests must be placed in `tests/e2e/` (run via Playwright). Unit/Service layer tests must be placed in `tests/unit/` (run via Vitest) to avoid ESM compilation and `import.meta` conflicts inside Playwright.

## Next.js Cache Revalidation
- **Rule**: Avoid using global layout revalidations like `revalidatePath("/", "layout")` inside Server Actions or API routes. This invalidates the entire Turbopack compile cache in development mode, causing slow page compiles and E2E test timeouts. Instead, use targeted revalidations (e.g., `revalidatePath("/")` and `revalidatePath("/history")`).

## API & Service Layer Architecture
- **Rule**: Keep API route handlers lean. Do not write business logic or database queries (Prisma) directly inside the route files. Instead, extract them to a dedicated service class in `lib/services/` (e.g., `budget.service.ts` or `expense.service.ts`). API route handlers must handle only HTTP protocol concerns (request/response serialization, Zod payload schema validation, and status codes).

## Playwright Testing Constraint
- **Rule**: Never run Playwright E2E tests (`npx playwright test` or similar) on your own.
- **Action**: If changes are ready to be E2E tested, ask the user to run them for you and report the results.
- **Rationale**: Playwright runs produce large console logs and consume substantial token counts.

## Git Commit Restrictions
- **Rule**: Never run `git commit` automatically.
- **Details**: Do not perform automatic git commits. After completing an implementation, bug fix, or execution, ask the user if they would like to commit the changes. Only proceed with the commit if the user explicitly instructs you to do so.
