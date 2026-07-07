import { buildParser } from "@lezer/generator";
import grammarSource from './compio-language.grammar?raw';
import { createIdentifierTokensTokenizer } from './compio-identifier-tokens';
import { createNumberWithUnitTokensTokenizer } from './compio-number-with-unit-tokens';
import { createHumanDateRules } from "./compio-date-tokens";
import { createExternalTokenizer } from "./external-tokenizer-config";


export const compioParser = buildParser(grammarSource, {
	moduleStyle: 'es',
	fileName: 'compio.build',
  externalTokenizer(name, terms) {
    if (name === 'dateTokenizer') {
      return createExternalTokenizer(createHumanDateRules({
        HumanDate: terms.HumanDate,
      }))
    }
		if (name === 'numberWithUnitTokens') {
			return createNumberWithUnitTokensTokenizer({
				Unit: terms.Unit,
				PercentSuffix: terms.PercentSuffix,
			});
		}
		if (name === 'identifierTokens') {
			return createIdentifierTokensTokenizer({
				Identifier: terms.Identifier,
			});
		}
		throw new Error(`Unexpected external tokenizer: ${name}`);
	},
})
