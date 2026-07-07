import { ExternalTokenizer, Stack, type InputStream } from '@lezer/lr';

import type { PrefixTree } from "../../lib/prefix-tree";
import { isSkippedWhitespace } from './symbols';


export type Atom = {
  optional?: boolean;
} & (
  | { match: (codeUnit: number) => boolean }
  | { vocabluary: PrefixTree }
);

export type ParserRule = {
  expect: Atom[];
  tokenID: number;
}

export function createExternalTokenizer(rulesSet: ParserRule[]) {
  return new ExternalTokenizer((input: InputStream, _stack: Stack) => {
    rules:
    for (let i = 0; i < rulesSet.length; i++) {
      const rule = rulesSet[i];
      let offset = 0;
      ruleExpectation:
      for (let i = 0; i < rule.expect.length; i++) {
        const atom = rule.expect[i];
        while (isSkippedWhitespace(input.peek(offset))) offset++;
        if ('vocabluary' in atom) {
          const matchedLength = atom.vocabluary.longestMatchUtf16(
            (localOffset: number) => input.peek(offset + localOffset)
          );
          offset += matchedLength;
          if (matchedLength > 0) {
            if (i === rule.expect.length - 1) break;
            continue ruleExpectation;
          }
        }
        else if ('match' in atom) {
          const matched = atom.match(input.peek(offset));
          if (matched) {
            offset++;
            if (i === rule.expect.length - 1) break;
            continue ruleExpectation;
          }
        }
        //NON-MATCH
        if (atom.optional) continue ruleExpectation;
        continue rules;
      }
      //FULL MATCH
      for (let k = 0; k < offset; k++) input.advance();
      input.acceptToken(rule.tokenID);
      return;
    }
  });
}
