import { PrefixTree } from "../../lib/prefix-tree";
import { type ParserRule } from "./external-tokenizer-config";
import { isDigit } from "./symbols";

const months = ["jan", "january", "feb", "february", "march", "mar", "april", "apr", "may", "june", "jun", "july", "jul", "august", "aug", "september", "sep", "sept", "october", "oct", "november", "nov", "december", "dec"];
const monthsVocabl = PrefixTree.fromWords(months);

export type DateTokens = {
  HumanDate: number;
};

export function createHumanDateRules(tokens: DateTokens): ParserRule[] {
  return [{
    // @digit @digit? {MONTH}
    expect: [
      { match: isDigit },
      { match: isDigit, optional: true },
      { vocabluary: monthsVocabl }
    ],
    tokenID: tokens.HumanDate,
  }, {
    // {MONTH} @digit @digit?
    expect: [
      { vocabluary: monthsVocabl },
      { match: isDigit },
      { match: isDigit, optional: true },
    ],
    tokenID: tokens.HumanDate,
  }]
}
