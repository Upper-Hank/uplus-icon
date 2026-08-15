# Icon Library Page Implementation Spec

## 0. Intake Summary

- Task type: page with reusable component variants.
- Accepted input: confirmed Figma node plus incremental follow-up links and assets.
- Output shape: one implementation spec with component sections.
- Completion rule: the supplied desktop node and maintainer-provided UI glyphs cover the current implementation; missing visual states remain incremental inputs.
- Current status: ready for implementation.

## 1. Coverage Tracker

| Component | Figma Link | Variants | States | Screenshot | User Confirmed | Status |
|---|---|---|---|---|---|---|
| Site header | provided | desktop/light | active navigation | yes | yes | ready |
| Icon toolbar | provided | desktop/light | grid active | yes | yes | ready |
| Flat content module | provided | flat grid without grouping | default/selected placeholder | yes | yes | ready |
| Collection content module | provided | category groups containing grids | default | yes | yes | ready |
| Responsive layout | missing | desktop/tablet/mobile | partial | no | no | inferred |
| Dark theme | partial via existing product behavior | dark | partial | no | no | inferred |

## 2. Scope And Sources

- Feature: Uplus Icon library browser redesign.
- Figma file: `HCcleuKKkwCak6qzLKvrQR`.
- Source node: `41:3532`.
- Target: `apps/site`.
- Included: shared header, icon toolbar, flat/collection view components, search, sort, language, theme, icon detail, documentation, responsive behavior.
- Preserved: shareable icon detail routes, documentation routes, metadata source, generated icon packages.
- Excluded: authoring or changing formal SVG assets.

## 3. Structure Map

- Root: site shell.
- First row: brand, primary navigation, appearance switch, language switch.
- Second row on icon page: search, sort control, flat/collection switch.
- Content: either one flat icon grid or metadata-driven category collections.
- Reusable components: segmented control, icon slot, toolbar, collection group, grid tile.
- Figma glyph instances in content are placeholders; production content comes from icon metadata and the React icon package.

## 4. Layout Rules

- Desktop canvas reference: 1440px.
- Desktop horizontal padding: 48px.
- Desktop content width: available width, 1344px at 1440px viewport.
- Header first row begins 24px from the top.
- Header and toolbar vertical gap: 24px.
- Toolbar and collection vertical gap: 28px.
- Control height: 40px.
- Icon hit area: 48px square.
- Icon render size: 24px.
- Grid gap: 16px.
- Responsive behavior is fluid and must not preserve fixed Figma coordinates.

## 5. Visual Rules

- Background: white in light theme.
- Primary text: black.
- Secondary text: `#8e8e8e`.
- Control surface: `#f1f1f1`.
- Selected icon tile surface: `#f0f0f0`.
- Outer segmented radius: 12px.
- Inner selected radius: 8px.
- Icon tile radius: 10px.
- Typography target: `Inter` for Latin characters and `Noto Sans SC` for Chinese, followed by system sans-serif fallbacks.
- Do not introduce Tailwind or a new component library.

## 6. Interaction Rules

- Navigation reflects the current route.
- Header remains fixed and shared navigation, appearance, language, and layout controls use one measured sliding indicator.
- Search matches name, localized title, tags, aliases, and category terms.
- `Cmd/Ctrl + K` focuses search.
- Sort supports catalog, published order, and name order with stable fallbacks.
- Flat/collection mode is controlled by one typed state value and persisted locally.
- Appearance and language choices remain persisted locally.
- Icon tiles update to the shareable detail route and open a bottom drawer over the library context.
- Closing the drawer returns to the icon library; `Escape` and backdrop click are supported.
- All interactive controls require visible keyboard focus.

## 7. Assets

- Brand uses the existing approved site favicon when visually compatible.
- Library icons render through `@uplus-icon/react/dynamic`.
- Approved grid, list, chevron, sun, and moon glyphs use transparent 24px canvases and `currentColor` through `components/UiIcon.tsx`.
- Do not download temporary Figma icon assets into the formal icon library.
- Do not edit `packages/icons/raw/**/*.svg`.

## 8. Token Mapping

- Figma variables: none returned for the node.
- Project mapping: page-specific CSS custom properties layered over existing theme variables.
- Raw Figma colors are recorded as page tokens.
- Dark values are inferred from the existing site theme until a dark Figma node is supplied.

## 9. Code Mapping

- Figma header -> `components/SiteChrome.tsx`.
- Shared control primitives -> `components/LibraryControls.tsx`.
- Shared page title structure -> `components/PageHeading.tsx`.
- Flat/collection content variants -> `components/IconCollection.tsx`.
- Page state and metadata derivation -> `pages/IconsPage.tsx`.
- Detail drawer -> `components/IconDetailDrawer.tsx`, mounted by `pages/IconsPage.tsx`.
- Detail preview workspace -> `components/IconDetailPreview.tsx`.
- Detail usage and metadata inspector -> `components/IconDetailInspector.tsx`.
- Documentation visual extension -> `pages/DocsPage.tsx`.
- Shared animated selection surface -> `components/SlidingSurface.tsx`.
- Page visual rules -> `styles.css` using scoped class names.
- Code Connect: unavailable for the current Figma plan.

## 10. Open Questions

- The search glyph remains a layout placeholder until the maintainer provides its approved asset.
- Mobile, dark, hover, and expanded sort-menu nodes can override current inferred behavior later.

## 11. Acceptance Checklist

- [x] Initial desktop coverage confirmed by user.
- [x] Structure matches the approved interpretation.
- [x] Layout and visual values captured.
- [x] Placeholder asset rule captured.
- [x] Metadata and code mapping captured.
- [x] Desktop implementation visually verified at 1440 × 1024.
- [x] Flat and collection modes verified after the corrected interpretation.
- [x] Search, sort, theme, and language verified.
- [x] Mobile layout verified at 390 × 844 without horizontal overflow.
- [x] Global Footer removed from every route.
- [x] Icon detail converted from a standalone page into a routed drawer and verified on desktop and mobile.
- [x] Documentation page aligned to the shared visual language with responsive desktop and mobile navigation.
- [x] Redundant rule-documentation heading removed from desktop and mobile navigation.
- [x] Mobile documentation navigation defaults to collapsed so the article remains in the first viewport.
- [x] Documentation routes and locale pairs validated.
- [x] Typecheck and production build pass.
