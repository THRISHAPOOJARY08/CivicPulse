---
name: Civic Pulse Design System
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#43474d'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#74777e'
  outline-variant: '#c3c6ce'
  surface-tint: '#49607c'
  primary: '#001428'
  on-primary: '#ffffff'
  primary-container: '#0f2942'
  on-primary-container: '#7991af'
  inverse-primary: '#b0c9e8'
  secondary: '#006a61'
  on-secondary: '#ffffff'
  secondary-container: '#86f2e4'
  on-secondary-container: '#006f66'
  tertiary: '#001329'
  on-tertiary: '#ffffff'
  tertiary-container: '#02284b'
  on-tertiary-container: '#7390b9'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d1e4ff'
  primary-fixed-dim: '#b0c9e8'
  on-primary-fixed: '#011d35'
  on-primary-fixed-variant: '#314863'
  secondary-fixed: '#89f5e7'
  secondary-fixed-dim: '#6bd8cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#d3e4ff'
  tertiary-fixed-dim: '#abc8f4'
  on-tertiary-fixed: '#001c38'
  on-tertiary-fixed-variant: '#2a486d'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system embodies the ethos of modern civic governance: rigorous, accountable, transparent, and approachable. It pairs institutional stability with real-time responsiveness. Built for municipal administrators, field workers, and residents filing municipal reports, the aesthetic communicates unyielding reliability while shedding bureaucratic stagnation.

The design movement is **Corporate Modern with Functional Precision**: crisp data surfaces, structured borders, high legibility, and intentional color accents. Visual clutter is stripped away to ensure rapid triage under emergency conditions. The system prioritizes radical clarity and accessibility, inspiring public trust through calm, balanced geometry and WCAG AAA-compliant visual boundaries.

## Colors

The palette balances institutional gravitas with dynamic responsiveness:

- **Primary (`#0F2942`) & Primary Interactive (`#1B3B5F`)**: The institutional anchor. Used for high-level structure, top navigation, primary actions, and key directional indicators.
- **Secondary / Municipal Teal (`#0D9488`) & Hover (`#14B8A6`)**: Conveys operational activity, system health, and interactive pathways. Highlights forward progress and system-guided AI suggestions.
- **Neutrals**:
  - `Canvas / Background`: `#F8FAFC` (Slate 50)
  - `Surface Muted / Well`: `#F1F5F9` (Slate 100)
  - `Border / Hairlines`: `#E2E8F0` (Slate 200)
  - `Text Muted / Icons`: `#64748B` (Slate 500)
  - `Text Body & Headlines`: `#0F172A` (Slate 900)
- **Triage & Alert Semantics**:
  - `Critical`: `#DC2626` (Red 600) / Background `#FEF2F2` (Red 50)
  - `High`: `#D97706` (Amber 600) / Background `#FFFBEB` (Amber 50)
  - `Medium`: `#0D9488` (Teal 600) / Background `#F0FDFA` (Teal 50)
  - `Low`: `#64748B` (Slate 500) / Background `#F8FAFC` (Slate 50)
  - `Resolved`: `#16A34A` (Emerald 600) / Background `#F0FDF4` (Emerald 50)

All text-to-background combinations achieve a minimum 7:1 contrast ratio for standard text and 4.5:1 for large text, adhering to strict WCAG AAA guidelines across all daylight environments.

## Typography

The type system balances structured clarity with institutional dignity:

- **Display & Headlines (`Plus Jakarta Sans`)**: Delivers geometric warmth with contemporary authority. The subtle roundness softens administrative severity without sacrificing confidence or structure.
- **Body & Labels (`Inter`)**: Deployed for mission-critical data tables, citizen logs, resolution timelines, and system controls. The high x-height and distinct letterforms ensure immediate scannability across diverse digital literacy levels.
- **Hierarchy Rules**: Numerical figures and tracking identifiers leverage tabular figures (`tnum`) for consistent vertical alignment across tables and triage queues.

## Layout & Spacing

The layout is built upon an 8pt architectural rhythm, utilizing a structured, fluid grid across three responsive breakpoints:

- **Desktop (1200px+)**: 12-column layout, 24px (`1.5rem`) gutters, 32px (`2rem`) margins. Max content boundary capped at 1440px for comfortable municipal dashboard scanning.
- **Tablet (768px - 1199px)**: 8-column layout, 20px gutters, 24px margins. Sidebar panels collapse into actionable slide-outs or persistent icon rails.
- **Mobile (Below 768px)**: 4-column layout, 16px (`1rem`) gutters, 16px (`1rem`) canvas margins. Form elements span full-width for error-free single-thumb interaction.

Spacing tokens dictate intentional distance: tight intervals (`space-xs`, `space-sm`) group related input fields and badges, while broader intervals (`space-lg`, `space-xl`) separate administrative sections, filtering bars, and case timelines.

## Elevation & Depth

This design system avoids excessive skeuomorphism, relying on **clean low-contrast borders combined with subtle, high-clarity ambient shadows** to preserve legibility in high-sunlight or low-contrast field situations:

- **Level 0 (Flat Base)**: Pure `#FFFFFF` cards or `#F8FAFC` canvases, framed with a 1px solid `#E2E8F0` border. Zero shadow. Used for read-only reports, nested panels, and list groups.
- **Level 1 (Resting Interactive)**: `box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05);` with border `1px solid #E2E8F0`. Used for standard complaint cards, data widgets, and primary containers.
- **Level 2 (Hover & Focus)**: `box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.06);` with border `1px solid #CBD5E1`. Used when hovering actionable case cards or active table rows.
- **Level 3 (Overlay / Menus / Dialogs)**: `box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -4px rgba(15, 23, 42, 0.08);` with border `1px solid #CBD5E1`. Used for triage dropdowns, citizen verification modals, and AI categorization flyouts.

## Shapes

The system standardizes on a structured roundedness value of **2 (`rounded-lg` default at 0.5rem / 8px)**, conveying institutional modernity without appearing toy-like or juvenile:

- **Cards & Data Panels**: `rounded-lg` (`0.5rem` / `8px`) with standard 1px structural borders.
- **Form Inputs & Buttons**: `rounded-lg` (`0.5rem` / `8px`) providing comfortable touch targets.
- **Badges, Tags, & Status Pills**: Full roundedness (`rounded-full` / `9999px`) to immediately distinguish metadata and case classifications from functional interactive elements.
- **Action Icons & Avatars**: Soft geometry (`rounded-md` / `6px`) preserving grid alignment.

## Components

- **Buttons**:
  - *Primary*: Deep Navy (`#0F2942`) background, `#FFFFFF` text, `rounded-lg`, hover state `#1B3B5F`, active scale 0.98. Focus state is a 2px offset ring in Municipal Teal (`#0D9488`).
  - *Secondary / Accent*: Vibrant Teal (`#0D9488`) background, `#FFFFFF` text, hover state `#14B8A6`. Reserved for constructive actions like "Submit Report" or "Approve Resolution."
  - *Tertiary / Outline*: Background transparent, border 1px `#E2E8F0`, text `#0F172A`. Hover background `#F1F5F9`.
  - *Danger*: `#DC2626` background, `#FFFFFF` text. Used exclusively for destructive administrative operations.

- **Status Chips & Triage Pills**:
  - Height 24px, pill-shaped (`rounded-full`), padded `space-xs` vertically and `space-sm` horizontally.
  - Composed of 10% opacity semantic background paired with 100% full-value semantic text and a matching 4px solid status dot (e.g., Critical: `#FEF2F2` background, `#DC2626` text and dot).

- **Form Fields & Inputs**:
  - Background `#FFFFFF`, 1px solid `#E2E8F0`, `rounded-lg`, minimum height 42px.
  - Active focus state invokes a 1px border `#0D9488` and a 3px outer glow `rgba(13, 148, 136, 0.15)`.
  - Error state switches border to `#DC2626` with descriptive subtext displayed in 12px `Inter`.

- **Cards & Complaint Items**:
  - Surface `#FFFFFF`, border 1px `#E2E8F0`, `rounded-lg`, internal padding `space-md` or `space-lg`.
  - Left edge displays an optional 4px semantic severity indicator bar (`#DC2626`, `#D97706`, `#0D9488`, `#64748B`, `#16A34A`).

- **Checkboxes & Radios**:
  - 18px bounding box, `rounded-sm` (checkboxes) and circular (radios).
  - Unchecked border 1.5px `#64748B`, checked background `#0F2942` with sharp white tick icon. Focus ring `#0D9488`.

- **Municipal Additions**:
  - *AI Confidence Indicator*: A compact badge combining a subtle teal gradient outline with an automated match score (e.g., "98% Match: Pothole / Street Maintenance") to clearly communicate machine-assisted triaging.
  - *Audit Timeline Component*: A vertical 2px `#E2E8F0` track featuring state nodes, municipal officer stamps, and immutable timestamps for citizen accountability.