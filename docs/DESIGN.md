---
name: Aura Finance
colors:
  surface: '#fcf8ff'
  surface-dim: '#dcd8e3'
  surface-bright: '#fcf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f2fd'
  surface-container: '#f0ecf7'
  surface-container-high: '#eae6f1'
  surface-container-highest: '#e4e1ec'
  on-surface: '#1b1b22'
  on-surface-variant: '#464553'
  inverse-surface: '#303038'
  inverse-on-surface: '#f3effa'
  outline: '#777585'
  outline-variant: '#c7c4d6'
  surface-tint: '#4f4ec8'
  primary: '#4c4bc6'
  on-primary: '#ffffff'
  primary-container: '#6665e0'
  on-primary-container: '#fffbff'
  inverse-primary: '#c2c1ff'
  secondary: '#5d5e63'
  on-secondary: '#ffffff'
  secondary-container: '#dfdfe4'
  on-secondary-container: '#616267'
  tertiary: '#595a73'
  on-tertiary: '#ffffff'
  tertiary-container: '#72728c'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c2c1ff'
  on-primary-fixed: '#0b006b'
  on-primary-fixed-variant: '#3633af'
  secondary-fixed: '#e2e2e7'
  secondary-fixed-dim: '#c6c6cb'
  on-secondary-fixed: '#1a1c1f'
  on-secondary-fixed-variant: '#45474b'
  tertiary-fixed: '#e1e0fe'
  tertiary-fixed-dim: '#c4c4e1'
  on-tertiary-fixed: '#181a2f'
  on-tertiary-fixed-variant: '#44455d'
  background: '#fcf8ff'
  on-background: '#1b1b22'
  surface-variant: '#e4e1ec'
typography:
  display:
    fontFamily: Manrope
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  margin-page: 24px
  gutter: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
  container-padding: 20px
---

## Brand & Style
The design system is built on a foundation of **Minimalist Calm** with a **Corporate Modern** execution. It aims to transform the often-stressful task of expense tracking into a serene, premium experience. Inspired by the clarity of Linear and the lifestyle-centric approach of Apple Health, the system prioritizes breathability over information density.

The brand personality is approachable yet precise. It avoids the aggressive "fintech" tropes of dark neon or complex data tables in favor of soft tonal layers, generous whitespace, and a high-end editorial feel. The emotional response should be one of "financial wellness" rather than "financial auditing."

## Colors
The palette is centered around a "Muted Iris" primary color that serves as the focal point for actions and key data visualizations. 

- **Primary:** A soft, sophisticated purple-blue (#7C7CF8) that feels premium and trustworthy.
- **Neutrals:** Backgrounds utilize off-whites and cool grays to prevent eye strain. In dark mode, pure black (#000000) is strictly avoided; instead, use a deep midnight navy (#1A1A24) to maintain depth and softness.
- **Accents:** Semantic colors for success (income), warning (budget limits), and error (over-budget) are desaturated and lean towards pastel tones to remain consistent with the "calm" aesthetic. Use these as subtle fills or thin strokes rather than loud blocks of color.

## Typography
This design system uses **Manrope** for its modern, geometric construction and exceptional legibility at varying scales. 

- **Hierarchy:** Financial figures (currency) should always use a heavier weight (600 or 700) to ensure they are the primary focal point of any view.
- **Spacing:** Negative letter-spacing is applied to larger display types to create a more "editorial" and premium feel, while labels utilize slight positive tracking to ensure clarity at small sizes.
- **Scaling:** On mobile, large display fonts scale down significantly to preserve whitespace and prevent line-wrapping of large financial amounts.

## Layout & Spacing
The layout philosophy is based on a **Fluid Grid** with generous safe areas. 

- **Vertical Rhythm:** A consistent 8px baseline is used, but components are spaced with a "breathable" mentality. Use `stack-lg` (32px) between major sections (e.g., between a chart and a list) to maintain the minimalist vibe.
- **Safe Zones:** Page margins are set to 24px on mobile to ensure content doesn't feel cramped against the screen edges.
- **Alignment:** Content is generally center-aligned for hero states (total balance) and left-aligned for transactional data.

## Elevation & Depth
Depth is created through **Tonal Layers** and **Ambient Shadows** rather than high-contrast borders.

- **The Base:** The lowest level is the neutral background.
- **The Card:** Elements sit on "Soft Elevated Cards" using a very diffused, low-opacity shadow (Color: Iris-Dark, Blur: 20px, Y: 4px, Opacity: 4-6%). 
- **The Floating Action:** The primary "Add" button uses a more pronounced shadow to indicate its global importance.
- **Glassmorphism:** Use subtle backdrop blurs (20px) on navigation bars and modal overlays to maintain a sense of context and "Apple-esque" polish.

## Shapes
The shape language is defined by "Squircle-inspired" soft corners. 

- **Standard Containers:** Cards and input fields use a 16px to 20px radius. 
- **Large Sections:** Background containers or "Hero" sections at the top of the screen should use 24px to 32px corner radius on bottom edges to create a soft, inviting transition.
- **Pills:** Buttons and status chips always utilize a fully rounded (pill) shape to emphasize touch-friendliness and approachability.

## Components

- **Cards:** The workhorse of the system. Cards must have `container-padding: 20px`. Backgrounds should be a shade lighter than the page background in dark mode, or pure white in light mode. No borders; use ambient shadows for definition.
- **Buttons:** 
  - *Primary:* Pill-shaped, Primary Iris background, White text.
  - *Secondary:* Pill-shaped, desaturated Primary background (10% opacity), Primary text.
  - *Touch Targets:* Minimum height of 56px for primary actions to ensure high accessibility.
- **Input Fields:** Large, 16px rounded corners with a subtle light-gray fill. Labels should be placed above the field in `label-sm`.
- **Chips/Badges:** Small, pill-shaped markers for categories. Use low-saturation background colors with higher-saturation text for readability.
- **Lists:** Transaction items should have generous vertical padding (16px) with a subtle hair-line divider that does not span the full width of the screen (inset by 24px).
- **Progress Bars:** Thicker, 8px heights with fully rounded ends. Use gradients sparingly—only within the Primary Iris spectrum.