---
name: unslop-ai-design
description: Eliminates generic "AI slop" in UI design. Replaces pastel clay blobs, cartoon shadows, and low-contrast fluff with institutional enterprise styling, crisp 1px borders, Space Mono numerical tabular data, and high-density layouts inspired by heydamir/unslop, elayadesign/ai-design-skills, and Nutlope/hallmark.
---

# Unslop AI Design & Hallmark Polish

## Overview

Eliminates the ubiquitous "AI-generated aesthetic" (pastel purple/yellow gradient blobs, low-contrast placeholder text, floating cards without borders, cartoon clay neomorphic shadows, and meaningless white space). Replaces it with the visual discipline of **Unslop**, **AI Design Skills**, and **Hallmark**:
- Razor-sharp 1px border hierarchy (`border-slate-200/80` in light mode, `border-slate-800` in dark mode)
- Institutional typography: `Plus Jakarta Sans` for headlines (tight tracking `-0.025em`) + `Space Mono` for all currency, timestamps, check sizes, and match scores
- Data-dense, utility-first layouts where every card provides real verified metrics rather than placeholder fluff
- Tactile, hardware-accelerated micro-interactions (radial spotlights, smooth border beams, shimmers)

## When to Use

- When any page or dashboard looks "vibe-coded", toy-like, or AI-generated
- When redesigning landing pages, tables, deal feeds, or administrative dashboards
- When setting up color palettes, typography tokens, elevation systems, and card borders
- When auditing a web application against enterprise SaaS quality standards

## Anti-Patterns to Eliminate Immediately

| AI Slop Anti-Pattern | Unslop & Hallmark Standard |
| :--- | :--- |
| **Pastel Clay Blobs:** Huge, unstructured purple/yellow/pink background circles with high blur. | **Crisp Neutral Slate:** Pure `#F8FAFC` background with subtle institutional gradients (`from-indigo-50/30 to-emerald-50/20`). |
| **Cartoony Brutalist Shadows:** Heavy black offset blocks (`box-shadow: -7px 7px 0px #000`). | **Tactile Enterprise Elevation:** Razor 1px border + soft multi-layer shadow (`0 1px 3px rgba(15,23,42,0.04), 0 10px 24px -6px rgba(15,23,42,0.02)`). |
| **Low-Contrast Gray Text:** `#9CA3AF` body text on white cards. | **High-Contrast Slate:** `#0F172A` headlines, `#334155` body text, `#64748B` labels. Meets WCAG AAA contrast. |
| **Monolithic Proportional Numbers:** Currencies and percentages rendered in default proportional sans. | **Space Mono Tabular Metrics:** All monetary amounts (`$120M+`), check sizes, and scores formatted with `font-mono-data` (`Space Mono`). |
| **Empty Margin Waste:** Giant 120px paddings surrounding 2 lines of text. | **High Information Density:** Dense, readable tables, bento grids, and clear visual hierarchy where data is directly actionable. |

## Core CSS Tokens

```css
:root {
  --font-sans: "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "Space Mono", ui-monospace, SFMono-Regular, monospace;

  /* Institutional Slate Palette */
  --bg-main: #F8FAFC;
  --card-bg: #FFFFFF;
  --text-main: #0F172A;
  --text-muted: #64748B;
  --border-light: #E2E8F0;
  --border-focus: #0F172A;

  /* Accent Tokens */
  --color-accent-emerald: #10B981;
  --color-accent-indigo: #4F46E5;
  --color-accent-amber: #F59E0B;
}

.institutional-card {
  background-color: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 24px;
  box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.03), 0 6px 16px -4px rgba(15, 23, 42, 0.02);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.institutional-card:hover {
  border-color: #CBD5E1;
  box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 12px 24px -4px rgba(15, 23, 42, 0.04);
}
```

## Component Architecture

1. **Card Headers:** Always pair an editorial category badge (e.g. `LIVE DEAL FEED`, `NON-DILUTIVE CAPITAL`) in `Space Mono` uppercase tracking with a high-contrast headline.
2. **Key Metric Pills:** Use emerald for verification (`✓ Verified Delaware C-Corp`), indigo for round sizes, and slate for stage tags.
3. **Cursor Spotlights:** Implement mouse-tracking radial gradients (`rgba(79, 70, 229, 0.08)`) that illuminate card borders dynamically on hover.

