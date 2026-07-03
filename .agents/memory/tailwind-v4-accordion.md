---
name: Tailwind v4 accordion animations
description: Radix accordion needs manually-defined keyframes in Tailwind v4 or sections won't expand
---

# Radix accordion in Tailwind v4

The shadcn `accordion` component uses classes `data-[state=open]:animate-accordion-down` and `data-[state=closed]:animate-accordion-up`. In Tailwind v4 these are NOT built-in and `tw-animate-css` does not provide them either.

**Symptom:** clicking an accordion header does nothing (section never expands) because the `animate-accordion-*` utilities resolve to nothing and Radix keeps the content collapsed.

**Fix:** in `index.css`, register the animations in the `@theme inline` block and define the keyframes:
```css
@theme inline {
  --animate-accordion-down: accordion-down 0.25s ease-out;
  --animate-accordion-up: accordion-up 0.25s ease-out;
}
@keyframes accordion-down { from { height: 0; } to { height: var(--radix-accordion-content-height); } }
@keyframes accordion-up { from { height: var(--radix-accordion-content-height); } to { height: 0; } }
```

**Why:** Radix drives the collapse via the `--radix-accordion-content-height` CSS var, but only if a real CSS animation is attached to the content element.

**How to apply:** any new artifact using the shadcn accordion (or any Radix collapse component relying on `animate-accordion-*`) in this Tailwind v4 monorepo must add these before the component will open/close.
