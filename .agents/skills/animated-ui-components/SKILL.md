---
name: animated-ui-components
description: Implements high-performance, modern animated UI components and micro-interactions. Combines patterns from MagicUI, React-Bits, Saasternity, Vivify, and CSSAnimation into zero-dependency React & Tailwind primitives (SpotlightCard, BorderBeam, NumberTicker, BadgeShimmer, LiveActivityMarquee, ShinyText, OrbitingCircles).
---

# Animated UI Components & Micro-Interactions

## Overview

A curated library of lightweight, zero-bloat animated UI primitives designed for high-conversion SaaS and Web3 applications. Inspired by:
- **MagicUI:** `BorderBeam`, `NumberTicker`, `Marquee`, `BentoGrid`
- **React-Bits:** `SpotlightCard`, `ShinyText`, `BlurText`
- **Saasternity & Aceternity:** Live dashboard widgets, metric pills, interactive preview tabs
- **Vivify & CSSAnimation:** Hardware-accelerated CSS keyframe choreography (`shimmer`, `pulsate`, `marquee`)

## Core Primitives Inventory

### 1. SpotlightCard (`src/components/ui/SpotlightCard.tsx`)
Mouse-tracking radial spotlight glow (`rgba(79, 70, 229, 0.08)`) that illuminates the border and elevates cards dynamically without external canvas or WebGL dependencies:
```tsx
<SpotlightCard spotlightColor="rgba(79, 70, 229, 0.08)">
  <h3>Curated Deal Flow</h3>
</SpotlightCard>
```

### 2. BorderBeam (`src/components/ui/BorderBeam.tsx`)
An animated beam of light that circles the perimeter of an institutional card using CSS `offset-path`:
```tsx
<div className="relative overflow-hidden rounded-3xl border border-slate-200">
  <BorderBeam size={220} duration={12} delay={2} colorFrom="#10B981" colorTo="#4F46E5" />
  {/* Card Content */}
</div>
```

### 3. NumberTicker (`src/components/ui/NumberTicker.tsx`)
High-performance easeOutExpo animated integer/counter for financial metrics ($120M+, 180+ VCs, 94% response rate):
```tsx
$<NumberTicker value={120} />M+
```

### 4. BadgeShimmer (`src/components/ui/BadgeShimmer.tsx`)
Editorial status pill badge with a continuous CSS shimmer sweep:
```tsx
<BadgeShimmer variant="emerald">30-Day Guaranteed Partner Meeting SLA</BadgeShimmer>
```

### 5. LiveActivityMarquee (`src/components/ui/LiveActivityMarquee.tsx`)
Infinite smooth horizontal ticker with pause-on-hover displaying real-time deal events (Term sheets, SAFEs, Grants).

### 6. ShinyText (`src/components/ui/ShinyText.tsx`)
Smooth linear-gradient shimmer sweeping across high-conviction typography.

## CSS Keyframe Presets (`src/index.css`)

```css
@keyframes marquee {
  0% { transform: translateX(0%); }
  100% { transform: translateX(-50%); }
}

@keyframes shimmer {
  100% { transform: translateX(100%); }
}

@keyframes border-beam {
  100% { offset-distance: 100%; }
}

@keyframes vivify-pulsate {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.03); opacity: 0.9; }
}

.animate-marquee { animation: marquee 35s linear infinite; }
.animate-border-beam { animation: border-beam calc(var(--duration)*1s) infinite linear; }
.animate-pulsate { animation: vivify-pulsate 3s ease-in-out infinite; }
```

## Best Practices

1. **Hardware Acceleration:** Always animate `transform` and `opacity` rather than `width`, `height`, or `top/left` to maintain 60–120 FPS.
2. **Accessible Motion:** Respect `prefers-reduced-motion` media query by disabling continuous loops or falling back to static visual hierarchy.
3. **Information First:** Never use animations purely for decoration; every motion must guide the eye toward verified data, conversion buttons, or status changes.

