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


