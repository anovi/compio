import { EditorState } from '@codemirror/state';
import type { RatesStore } from '@compio/calculator';
import { describe, expect, it } from 'vitest';

import { calcRanges, getRatesStore } from './values-field';

describe('calcRanges rate store injection', () => {
  it('uses the supplied store instead of the browser singleton', () => {
    const store = {} as RatesStore;
    const state = EditorState.create({ extensions: [calcRanges(store)] });
    expect(getRatesStore(state)).toBe(store);
  });
});
