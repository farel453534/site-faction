---
name: Flyout/dropdown outside-click closes before link click
description: Why a nav flyout link fails to navigate when the outside-click handler runs on mousedown
---

A popover/flyout that closes via a `document` `mousedown` listener will DESTROY its own
child links before their `click` fires: mousedown → handler unmounts the flyout →
mouseup/click lands on nothing → no navigation.

**Why:** mousedown precedes click. If the handler only whitelists the trigger (e.g. the
icon rail) but not the flyout panel itself, clicking a link inside the panel counts as
"outside" and closes it mid-click.

**How to apply:** the outside-click check must exclude BOTH the trigger and the panel
(`!triggerRef.contains(t) && !panelRef.contains(t)`). Attach a ref to the panel too.
Alternatively close on `click` instead of `mousedown`, or use Radix Popover which handles
this. Symptom in tests: flyout opens and lists items, but clicking an item does nothing.
