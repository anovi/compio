# Compio design guidelines

Compio should feel like a calm, capable notebook: direct, lightweight, and focused on the user’s work. The product and promotional website share the same visual language. The website may use more space and larger type, but should not introduce a separate brand style.

## Principles

- **Content first.** Keep chrome quiet and let calculations, examples, and explanations lead.
- **Useful, not decorative.** Every color, surface, icon, and animation should communicate meaning or affordance.
- **Native and immediate.** Prefer familiar controls, system fonts, generous touch targets, and fast feedback.
- **Simple at every size.** Adapt layouts rather than shrinking them; single-column mobile views are the default fallback.

## Visual system

### Typography

Use the system sans-serif stack for interface and marketing copy, and the system monospace stack for calculations, code, and live editor content. Body text is `16px` with `1.5` line height. Use weight and scale sparingly; headings are compact, confident, and free of ornamental styling.

### Colors

The canonical palette and semantic color tokens live in the shared [brand theme](packages/brand/theme.css). Consume these `--brand-color-*` custom properties instead of copying their raw values or introducing page-specific colors.

The palette is neutral and restrained, with teal reserved for interactive and meaningful emphasis:

- Light background `#f8f8f6`; primary text `#4a515b`; secondary text `#67696d`.
- Dark background `#202020`; primary text `#ffffff`; secondary text `#cdcdcd`.
- Brand and action accent `#19706a`; bright dark-theme accent text/icon `#50ece0` or `#79cec9`.
- Each theme provides three progressively stronger surface tokens and three border tokens at roughly 6%, 12%, and 18% contrast. Choose the lowest level that communicates the necessary separation.

Support light and dark themes equally. Use tokens by role: background and surface tokens establish hierarchy; primary and secondary text tokens establish emphasis; border tokens separate regions; accent and on-accent tokens communicate interaction. Teal is for actions, selections, links, and meaningful emphasis—not large decorative areas. Syntax colors belong to calculations and should not spread into general UI.

## Layout and components

Use a small, consistent spacing rhythm based on `4px`, with common gaps of `8`, `12`, `18`, and `24px`. Keep reading widths comfortable and give promotional sections more breathing room than the app. Align content to a clear grid; avoid gratuitous cards when spacing or a subtle divider is enough.

Controls are compact and plain. Icon buttons use a minimum `48 × 48px` hit area. Standard controls use about a `6px` radius; reserve pill shapes for results, tags, and small singular actions. Primary actions use the accent with white text. Secondary actions are transparent or use a quiet surface. Prefer thin low-contrast borders and subtle layered shadows; elevation should indicate a real overlay, menu, or drawer.

Use simple, consistent line icons. Product screenshots and interactive editor examples are the primary visual assets on the promo site; frame them with the same backgrounds, borders, radii, and syntax colors as the real product. Avoid generic illustration, gradients, glass effects, and decorative texture.

## Interaction and accessibility

Keep transitions brief (`120–200ms`) and limited to state changes such as hover, selection, drawers, and backdrops. Preserve visible keyboard focus, readable contrast, semantic HTML, and touch-friendly targets. Do not rely on color alone to convey state. Respect reduced-motion and system color-scheme preferences.

When extending the design, reuse existing tokens and patterns first. A new pattern should make Compio clearer or easier to use—not merely more visually busy.
