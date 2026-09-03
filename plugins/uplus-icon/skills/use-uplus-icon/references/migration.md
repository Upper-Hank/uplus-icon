# Migrating another icon library

Migrate by product meaning, not by mechanically translating component names.

1. Inventory the target files and locate every import from the old library.
2. Identify each icon's action, object, direction, or state in its actual UI context.
3. Search the installed Uplus catalog with those concepts and compare real candidates.
4. Preserve surrounding size, color, class names, layout, event handling, and accessible naming.
5. Replace fixed icons with named or per-icon imports. Use the dynamic registry only if the old code was genuinely data-driven.
6. Typecheck and build, then search the whole repository for remaining imports from the old library.
7. Remove the old dependency only when no usages remain and the user authorizes dependency removal.

If there is no close published Uplus equivalent, report the gap. Do not copy the old SVG into Uplus Icon, redraw it, or silently choose a materially different symbol.
