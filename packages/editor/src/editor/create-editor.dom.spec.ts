// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@compio/web-ui', async importOriginal => {
  const actual = await importOriginal<typeof import('@compio/web-ui')>()
  return { ...actual, isMobileDevice: () => true }
})

import { createEditor } from './create-editor'
import { ToggleToolbar } from './effects'

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

function rect(): DOMRect {
  return {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    toJSON: () => ({}),
  }
}

beforeEach(() => {
  document.body.replaceChildren()
  vi.stubGlobal('ResizeObserver', ResizeObserverStub)
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(0)
    return 1
  })
  vi.stubGlobal('cancelAnimationFrame', vi.fn())
  Range.prototype.getClientRects = () => [] as unknown as DOMRectList
  Range.prototype.getBoundingClientRect = rect
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('createEditor DOM integration', () => {
  it('keeps two instances independent and supports lifecycle, themes, and toolbar options', () => {
    const firstHost = document.createElement('div')
    const secondHost = document.createElement('div')
    document.body.append(firstHost, secondHost)

    const first = createEditor({
      parent: firstHost,
      doc: '',
      isDark: false,
      placeholder: 'First calculation',
    })
    const second = createEditor({
      parent: secondHost,
      doc: '',
      placeholder: 'Second calculation',
      mobileToolbar: false,
    })

    expect(firstHost.classList.contains('compio-editor')).toBe(true)
    expect(secondHost.classList.contains('compio-editor')).toBe(true)
    expect(firstHost.dataset.compioTheme).toBe('light')
    expect(secondHost.dataset.compioTheme).toBe('dark')
    expect(firstHost.querySelector('.cm-placeholder')?.textContent).toBe('First calculation')
    expect(secondHost.querySelector('.cm-placeholder')?.textContent).toBe('Second calculation')
    expect(first.getDocument()).toBe('')
    expect(second.getDocument()).toBe('')

    first.setDocument('distance = 10 km')
    second.setDocument('3 + 3')
    first.setColorScheme(true)
    expect(first.getDocument()).toBe('distance = 10 km')
    expect(second.getDocument()).toBe('3 + 3')
    expect(firstHost.dataset.compioTheme).toBe('dark')

    first.view.dispatch({ effects: ToggleToolbar.of(true) })
    expect(firstHost.querySelector('.cm-panels-bottom .cm-suggestions-panel')).not.toBeNull()
    expect(secondHost.querySelector('.cm-suggestions-panel')).toBeNull()
    expect(document.querySelector('[id="cm-suggestions-panel"]')).toBeNull()

    first.destroy()
    second.destroy()
    expect(firstHost.querySelector('.cm-editor')).toBeNull()
    expect(secondHost.querySelector('.cm-editor')).toBeNull()
    expect(firstHost.classList.contains('compio-editor')).toBe(false)
    expect(firstHost.dataset.compioTheme).toBeUndefined()
  })

  it('portals one editor toolbar and removes its panel and viewport listeners on destroy', () => {
    const host = document.createElement('div')
    const portal = document.createElement('div')
    document.body.append(host, portal)

    const addEventListener = vi.fn()
    const removeEventListener = vi.fn()
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: { height: 800, offsetTop: 0, addEventListener, removeEventListener },
    })
    const onVisibilityChange = vi.fn()

    const editor = createEditor({
      parent: host,
      doc: '10 USD in EUR',
      mobileToolbar: { portalContainer: portal, onVisibilityChange },
    })

    editor.view.dispatch({ effects: ToggleToolbar.of(true) })

    const toolbar = portal.querySelector<HTMLElement>('.cm-suggestions-panel--portaled')
    expect(toolbar).not.toBeNull()
    expect(toolbar?.id).toBe('')
    expect(host.querySelector('.cm-suggestions-panel-spacer')).not.toBeNull()
    expect(onVisibilityChange).toHaveBeenCalledWith(true)
    expect(addEventListener).toHaveBeenCalledWith('resize', expect.any(Function))

    editor.setColorScheme(false)
    expect(toolbar?.dataset.compioTheme).toBe('light')

    editor.destroy()
    expect(portal.querySelector('.cm-suggestions-panel')).toBeNull()
    expect(removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function))
    expect(onVisibilityChange).toHaveBeenLastCalledWith(false)
  })
})
