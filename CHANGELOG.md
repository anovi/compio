# Changelog

## 0.2.0 — 2026-09-27

### Added

- Currency amounts can use supported symbols as either a prefix or suffix, with or without a space—for example, `$10`, `23$`, and `€ 23.5`. The `$` symbol is interpreted as USD.
- Multiplying a currency amount by a non-currency value now keeps the currency unit—for example, `10 hours * 2 EUR` produces `20 EUR`.
- Dividing two values with the same unit now produces a unitless ratio—for example, `10 EUR / 10 EUR` produces `1`.

### Improved

- Unit recognition is faster, improving parsing and suggestions in documents that use units or currencies.
