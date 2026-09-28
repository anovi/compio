# Compio Distribution Features

This matrix defines the intended roles of the Compio PWA, Chrome extension, and embedded calculator. The extension is a lightweight, useful entry point for quick calculations, the PWA is the complete workspace for managing documents, and the embedded calculator provides a temporary interactive editor within the user manual.

| Feature | PWA | Chrome extension | Embedded |
| --- | --- | --- | --- |
| Primary role | Full calculation workspace | Fast scratch calculator and entry point to the PWA | Interactive calculator in the user manual |
| Calculation editor | Yes | Yes | Yes |
| Currency conversions | Yes | Yes | Yes |
| Offline calculation | Yes | Yes | Yes, while the user manual is available |
| Light, dark, and system themes | Yes | Yes | Follows the user manual theme |
| Calculation templates | Yes | — | — |
| Multiple documents | Yes; up to 3 on the free plan | No; one persistent scratchpad | No; one temporary editor |
| Unlimited documents | 💳 Paid plan | — | — |
| Document list and navigation | Yes | — | — |
| Rename, duplicate, and delete documents | Yes | Clear or reset scratchpad only | Clear or reset editor only |
| Document search | Yes | — | — |
| Import and export as plain text | Yes | Copy or send scratchpad to PWA | Copy only |
| Installable application | PWA | Chrome Web Store extension | — |
| Send selected webpage text to the calculator | — | Yes, through a user-invoked context-menu action | — |
| Open scratchpad as a PWA document | — | Yes, through **Continue in Compio** | — |
| Cloud synchronization | 💳 Paid plan | No; may hand off to the PWA | — |
| Cross-device access | 💳 Paid plan | — | — |

## Product boundary

The extension should remain useful without an account or subscription. Its main job is to make Compio available in one click while browsing. When a calculation becomes worth keeping or organizing, the user can deliberately transfer it to the PWA.

The PWA should own long-term document management, and cloud synchronization (as paid feature). Core calculation capabilities should remain available in both distributions so that the extension accurately demonstrates the product.
