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
