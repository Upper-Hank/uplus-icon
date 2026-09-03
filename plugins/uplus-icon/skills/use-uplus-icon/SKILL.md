---
name: use-uplus-icon
description: Find, install, integrate, migrate, or review Uplus Icon usage in React projects. Use when the user explicitly requests Uplus Icon, invokes this skill, or the target project already depends on @uplus-icon/react; do not replace another icon library merely because a task mentions icons.
---

# Use Uplus Icon

Help consumers use the public Uplus Icon packages. Work only in the consumer project; do not rely on the Uplus Icon source repository, its raw SVG files, metadata authoring files, generators, or release workflow.

## Workflow

1. Inspect the target project's package manager, workspace layout, React version, existing Uplus dependencies, and current icon-library conventions.
2. Preserve the user's selected library. If they did not select Uplus Icon and the project does not already use it, ask before introducing it when that choice would materially affect the result.
3. If `@uplus-icon/react` is missing and the user has asked to use Uplus Icon, install it with the project's existing package manager. Respect an installed version; do not upgrade it implicitly.
4. Search the installed catalog with `node <skill-dir>/scripts/search-icons.mjs --cwd <project-dir> <terms>`. Use short nouns, directions, and bilingual synonyms. Retry with narrower or translated terms when the first query is empty; never invent an icon name.
5. Compare a small set of real candidates against the UI meaning. When ambiguity matters, show the candidates and let the user choose. Otherwise make the smallest reasonable choice and state it briefly.
6. Read [references/react.md](references/react.md) before changing React imports or props. Read [references/accessibility.md](references/accessibility.md) when the icon conveys meaning or when reviewing accessibility. Read [references/migration.md](references/migration.md) only when replacing another icon library.
7. Make the smallest scoped code change. Preserve event handling, layout, class names, styling, and surrounding component behavior.
8. Run the consumer project's relevant typecheck and build or test commands. For import-strategy changes, confirm fixed icons do not pull in the dynamic registry.

## Boundaries

- Treat search results as candidates, not design approval.
- Use only public package exports. Do not copy SVG source from the website or package internals.
- Do not add, redraw, optimize, or repair icons.
- Do not remove an old icon dependency until repository-wide usage proves it is unused and the user authorizes removal.
- Report when no suitable published icon exists instead of substituting an unapproved asset.
