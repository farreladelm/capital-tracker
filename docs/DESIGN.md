# Design Guidelines: Capital Tracker

## Design Philosophy
The app must feel completely frictionless, playful, and distinct from traditional "accountant" financial dashboards. It should look like a modern, friendly consumer app (think Duolingo or a well-designed chat app) rather than a spreadsheet.

## Typography
- **Primary Font:** A friendly, rounded sans-serif font (e.g., `Nunito`, `Quicksand`, or modern `Inter` with high tracking). 
- **Hierarchy:** Large, bold headings for totals. Soft, legible text for transaction details. No dense walls of small text.

## Color Palette (Proposed)
- **Background:** Soft, clean off-white (`#F8FAFC` or Tailwind `slate-50`) in light mode, deep dark blue (`#0F172A` or Tailwind `slate-900`) in dark mode.
- **Accents (Categories):** Vibrant, distinct pastel or neon colors for categories so the pie chart is instantly readable (e.g., Watermelon Red for Food, Electric Blue for Transport, Mint Green for Fun).
- **Text:** High contrast but soft (e.g., `slate-800` rather than pure black).
- **Error States:** Friendly orange/red, not a scary critical red.

## Core UI Components

### 1. The Main Input (The "Magic" Box)
- **Position:** Anchored to the bottom or middle of the screen, prominent and large.
- **Look:** Like a modern chat input bubble. Deep rounded corners (`rounded-full`), soft shadow (`shadow-lg`).
- **Interaction:**
  - On focus: Subtle glow or border color change.
  - On loading (AI parsing): A playful spinner or sparkle animation inside the button.
  - On error (missing amount): A gentle CSS shake animation (`animate-shake`) and a soft tooltip or inline text that appears below it.

### 2. Transaction List
- **Layout:** Vertical list of cards.
- **Look:** Each item is a card with a high border-radius (`rounded-2xl` or `rounded-xl`).
- **Icons:** Use large, colorful Emojis or simple SVG icons for categories (🍔 for Food, 🚌 for Transport) next to the item.
- **Spacing:** Generous padding (`p-4`), avoiding cramped rows.

### 3. The Pie Chart
- **Style:** A "Donut" chart is preferred over a solid pie chart as it looks more modern.
- **Cleanliness:** No grid lines, no complex legends. Just bold slices of color that match the category icons.

## Layout & Responsiveness
- **Mobile-First:** The UI is designed for a thumb-reach on a smartphone.
- **Desktop:** On larger screens, the app should likely be constrained to a centered, phone-width container (like a widget) so the UI doesn't stretch awkwardly, maintaining the tight, fast feel.

## Micro-animations
- Animations must be fast (<300ms) so they don't block the user.
- **Entering items:** Transactions slide down into the list.
- **Updates:** The total number should ideally "count up" quickly rather than just instantly snapping to the new number.
