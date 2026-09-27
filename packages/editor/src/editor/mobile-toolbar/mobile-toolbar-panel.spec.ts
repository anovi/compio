import { describe, expect, it, vi } from 'vitest';

import { notifyMobileToolbarVisibility } from './mobile-toolbar-panel';

describe('mobile toolbar visibility callback', () => {
  it('forwards visibility changes to the host application', () => {
    const listener = vi.fn();
    notifyMobileToolbarVisibility(listener, true);
    notifyMobileToolbarVisibility(listener, false);
    expect(listener.mock.calls).toEqual([[true], [false]]);
  });
});
