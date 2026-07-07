---
name: conventional-commits
description: Formulates proper Git commit messages with conventional prefixes. Use when proposing or executing Git commits.
---

# Conventional Commits Skill

## Overview
This skill guides the selection of the correct commit message prefix and structure when committing changes to the repository. Consistency in commit messages makes the git history clean, searchable, and easy to review.

## Commits Prefix Table

Use the following table to determine the correct prefix for your changes:

| Prefix | Meaning | Usage |
| :--- | :--- | :--- |
| `feat` | New feature | Adding a new capability, page, component, or endpoint. |
| `fix` | Bug fix | Fixing broken code, resolving crashes, type errors, or incorrect logic. |
| `refactor` | Code improvement | Changing code structure/design without changing external behavior or logic. |
| `perf` | Performance improvement | Optimizing execution speed, memory footprint, or page render times. |
| `test` | Add or update tests | Adding unit tests, E2E tests, integration tests, or mock configs. |
| `docs` | Documentation | Updating README, AGENTS.md, inline doc comments, or design specifications. |
| `style` | Formatting only | Fixing whitespace, commas, semicolons, or general formatting (no logic changes). |
| `build` | Build system | Updating packages, config files (e.g. package.json, next.config.ts), or bundlers. |
| `ci` | CI/CD changes | Modifying GitHub Actions workflow configs, test pipelines, or scripts. |
| `chore` | Maintenance | General cleanup, setup tasks, or miscellaneous tasks. |
| `revert` | Revert a commit | Reversing a previous commit ID. |
| `security` | Security changes | Hardening code, fixing security alerts, patching dependencies. |
| `db` | Database | Schema files, migrations, seed scripts, database client config. |
| `api` | Backend API changes | Modifying REST, GraphQL endpoints, route handlers, or API schema validation. |
| `ui` | Frontend UI changes | Modifying visual look and feel, colors, typography, layout, CSS, design tokens. |

## Selection Guidelines
1. **Core prefixes vs Extensions:** For standard changes, prefer the core prefixes (`feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `build`, `ci`, `chore`, `revert`). Use the extended prefixes (`security`, `db`, `api`, `ui`) when the change is highly specific to those areas and calling it out improves visibility.
2. **One logical change per commit:** If a change spans multiple prefixes (e.g., refactoring logic AND adding a new feature), split them into separate commits.

## Commit Message Format

```
<prefix>: <short description in lowercase, imperative mood>

<optional body explaining why the change was made, not what the code does>
```

### Examples

* **Good:**
  * `feat: add onboarding screen with currency selection`
  * `fix: cache PrismaLibSql adapter to prevent connection leaks on HMR reload`
  * `refactor: extract success UI card into standalone component`
  * `db: add currency and category models to schema`

* **Bad (Do not use):**
  * `chore: fix bug in categories` (should be `fix:`)
  * `update page` (missing prefix)
  * `WIP` (no meaning or description)
