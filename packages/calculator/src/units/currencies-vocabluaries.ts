import type { CurrencyEntry } from "./types";
import { normalizeMeasureUnit } from "./unit-name-normalizer";

export type { CurrencyEntry };

export type CurrencyCode = string;

/**
 * Circulating currencies from `currencies-list.csv`.
 *
 * See https://en.wikipedia.org/wiki/List_of_circulating_currencies
 */
export const CURRENCIES: readonly CurrencyEntry[] = __CURRENCIES__;

/** ISO codes derived from {@link CURRENCIES}. */
export const CURRENCY_CODES: readonly string[] = CURRENCIES.map((c) => c.code);

export const CURRENCY_SYMBOLS: string[] = CURRENCIES.map((c) => c.symbol).filter(s => {
  // To exclude currency symbols that match unit names
  // for example Turkmenistani mana (m)
  return s && normalizeMeasureUnit(s) === null
}) as string[];

export const CURRENCY_SYMBOLS_SET: ReadonlySet<string> = new Set(CURRENCY_SYMBOLS);

export const CURRENCY_SET: ReadonlySet<string> = new Set(CURRENCY_CODES);