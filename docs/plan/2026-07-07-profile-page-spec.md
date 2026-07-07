# Account/Profile Page Specification
**Date:** 2026-07-07

This document outlines the blueprint for implementing the `/account` profile page, permitting users to personalize their name and preferred currency settings, sign out, and align navigation visuals.

---

## 1. Visual & Interactive Requirements

### A. Navigation Icon Update
- The Bottom Navigation Bar currently uses a `settings` (gear) icon for the "Profile" link.
- Update the icon name in `BottomNav` to `person` (user outline) for a cleaner, personalization-focused look.
- Synchronize other desktop header navigation elements if applicable.

### B. Account / Profile Layout
The layout must match the serene, Apple Health-style aesthetic of Aura Finance:
- **Header:** Title "Profile" with sub-label "Personalization & settings".
- **Details Section:** Card showing non-editable email details (since login is email-based) and profile info.
- **Settings Form:**
  - Input field for Display Name.
  - Custom Select dropdown or styled picker for Preferred Base Currency (`USD`, `IDR`, `JPY`).
  - Styled "Save Changes" button. When loading, show a loading spinner and disable submissions.
- **Danger Zone / Sign Out:**
  - Serene but distinct "Sign Out" section with a custom logout button.
  - Clicking "Sign Out" invalidates NextAuth credentials session and redirects cleanly to `/login`.

---

## 2. Technical Data Flow

```mermaid
graph TD
    Client[Profile page.tsx] -->|Submit Update Form| ProfileAction[updateProfile Server Action]
    ProfileAction -->|Update SQLite| DB[(SQLite Database)]
    ProfileAction -->|Revalidate Cache| PathRevalidation[revalidatePath /account & /]
    Client -->|Click Sign Out| AuthAction[logout Server Action]
    AuthAction -->|NextAuth signOut| Redirect[/login]
```

### Server Action: `app/actions/profile.ts`
Implement a secure server action:
- Authenticate via `auth()`.
- Parse and validate `name` (string, required) and `currency` (`USD`, `IDR`, `JPY`).
- Perform DB update using Prisma.
- Revalidate paths `/` (dashboard) and `/account` (profile) to ensure currency formatting resets properly across views.

### Server Action: `app/actions/auth.ts`
Add a logout function:
- Export a wrapper action `logout()` calling NextAuth's `signOut({ redirectTo: "/login" })`.

---

## 3. Implementation Steps

1. **Update Nav Icons:** Modify `app/components/BottomNav.tsx` and `app/trends/page.tsx` header links to use `person` instead of `settings`.
2. **Server Actions Setup:**
   - Define `logout` in `app/actions/auth.ts`.
   - Create `app/actions/profile.ts` containing the `updateProfile` action.
3. **Route Directory:** Create the `app/account` folder.
4. **Profile UI Component:** Create `app/account/page.tsx` loading user settings, rendering forms using custom styled elements (reusing our select styles or Custom Select dropdown), and handling success/error states.
5. **Validation:** Run unit tests and production build compiler.
