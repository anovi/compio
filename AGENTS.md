# Repository Guidelines

Compio is an npm-workspace monorepo for a document-style calculator.

## Project layout

- `apps/pwa`: shipped PWA and application workflows.
- `apps/website`: marketing website.
- `packages/calculator`: parser, evaluation, units, and exchange rates.
- `packages/editor`: reusable CodeMirror behavior.
- `packages/web-ui`: shared DOM components and browser utilities.

## Working conventions

- Use strict TypeScript and follow the style of nearby code.
- Keep features in the workspace that owns them. Import other workspaces only through their public `@compio/*` exports; never import another workspace's `src` files.
- Keep tests beside their implementation as `*.spec.ts`, and add or update focused tests when behavior changes.
- Do not hand-edit the generated Lezer parser. Change the grammar and run `npm run grammar` instead.
- Do not commit build output or unrelated formatting changes.

## Validation

Run the narrowest relevant test while iterating, then use the root checks before handing off substantial changes:

```sh
npm test
npm run typecheck
npm run lint
npm run build
```

Use `npm ci` for a clean dependency install and `npm run dev` for local development.

## Styling & CSS Conventions

Use native CSS cascade layers. Keep all project styles within these layers, declared in this order:

```css
@layer theme, base, components, utilities;
```

- **`theme`** — Design tokens and global variables: colors, typography, spacing, breakpoints, etc. Prefer CSS custom properties.
- **`base`** — Element defaults, resets, and global document styles (`body`, headings, links, code, etc.). Avoid component-specific selectors.
- **`components`** — Reusable UI components and their states. Prefer semantic component classes over utility-like classes.
- **`utilities`** — Small, single-purpose overrides that should take precedence over component styles.

### Rules

1. Do not add unlayered CSS. Every project rule must belong to one of the four layers.
2. Choose a layer by responsibility, not by selector specificity.
3. Keep specificity low; do not increase specificity to override another layer.
4. Prefer CSS custom properties defined in `theme` for shared design values.
5. Avoid `!important`. Use layer precedence when an override is needed.
6. Do not create additional layers without an architectural reason.
7. Use `@scope` when styles need a DOM boundary; do not use it as a replacement for layers.
8. Preserve the layer order: `theme → base → components → utilities`.
9. Keep document-wide rules such as `:root`, `html`, and `body` outside component scopes.