import { EditorView } from 'codemirror'
import { EditorState, type Extension } from '@codemirror/state'
import { placeholder } from '@codemirror/view'
import { syntaxHighlighting } from '@codemirror/language'
import { autocompletion } from '@codemirror/autocomplete'

import { compio } from '@compio/calculator'

import { basicSetup } from './basic-setup'
import { calcClipboard } from './clipboard'
import { calcRanges } from './values-field'
import { calcResultTooltips, calcResultsPlugin } from './result'
import { functionArgsTooltip } from './function-args/function-args-tooltip'
import { variableHoverTooltip } from './variables/variable-tooltip'
import { createEditorTheme, reconfigureEditorTheme } from './base-theme'
import { formatOnType } from './formatting'
import { unitCompletionSource, variableCompletionSource } from './autocompletion'
import { helpPanel } from './mobile-toolbar'
import { calcSyntaxLinter } from './linter'
import { renameVariableReferences } from './variables/rename-variable-references'
import { compioHighlightStyle } from './language-tools/compio-syntax-highlight-tags'
import { hackSafariTouchSelection } from './safari-selection-hack'
import { calcBindingFold } from './folding/line-fold'
import { ratesStore as defaultRatesStore, type RatesStore } from '@compio/calculator'

export type CreateEditorOptions = {
  parent: HTMLElement
  doc: string
  isDark?: boolean
  extraExtensions?: Extension[]
  ratesStore?: RatesStore
  placeholder?: string
  mobileToolbar?: false | {
    portalContainer?: HTMLElement
    onVisibilityChange?: (visible: boolean) => void
  }
}

export type EditorInstance = {
  view: EditorView
  extensions: Extension[]
  getDocument: () => string
  setDocument: (content: string) => void
  setColorScheme: (isDark: boolean) => void
  destroy: () => void
}

export function createEditor({
  parent,
  doc,
  isDark = true,
  extraExtensions = [],
  ratesStore = defaultRatesStore,
  placeholder: placeholderText = 'Write a formula or variable',
  mobileToolbar = {},
}: CreateEditorOptions): EditorInstance {
  let currentIsDark = isDark
  let portaledToolbar: HTMLElement | null = null
  let copiedToolbarProperties: string[] = []

  parent.classList.add('compio-editor')
  parent.dataset.compioTheme = currentIsDark ? 'dark' : 'light'

  function syncPortaledToolbarTheme(panel: HTMLElement | null) {
    portaledToolbar = panel
    if (!panel) {
      copiedToolbarProperties = []
      return
    }

    for (const property of copiedToolbarProperties) panel.style.removeProperty(property)
    const styles = getComputedStyle(parent)
    copiedToolbarProperties = Array.from(styles).filter(property => property.startsWith('--'))
    for (const property of copiedToolbarProperties) {
      panel.style.setProperty(property, styles.getPropertyValue(property))
    }
    panel.dataset.compioTheme = currentIsDark ? 'dark' : 'light'
  }

  const toolbarExtensions = mobileToolbar === false
    ? false
    : {
        ...mobileToolbar,
        onPanelElementChange: syncPortaledToolbarTheme,
      }

  const buildExtensions = (dark: boolean): Extension[] => [
    basicSetup(),
    compio(),
    autocompletion({
      maxRenderedOptions: 20,
      override: [unitCompletionSource, variableCompletionSource],
    }),
    hackSafariTouchSelection,
    formatOnType(),
    renameVariableReferences(),
    calcRanges(ratesStore),
    calcClipboard(ratesStore),
    calcResultsPlugin,
    calcBindingFold(),
    calcResultTooltips(),
    functionArgsTooltip(),
    variableHoverTooltip,
    syntaxHighlighting(compioHighlightStyle),
    helpPanel(toolbarExtensions),
    placeholder(placeholderText),
    createEditorTheme(dark),
    calcSyntaxLinter,
    // safariFocusScrollFix(),
    // emptyLineGutter,
    ...extraExtensions,
  ]

  const extensions = buildExtensions(currentIsDark)

  const view = new EditorView({
    parent,
    state: EditorState.create({ doc, extensions }),
  })

  return {
    view,
    extensions,
    getDocument() {
      return view.state.doc.toString()
    },
    setDocument(content: string) {
      view.setState(EditorState.create({ doc: content, extensions: buildExtensions(currentIsDark) }))
    },
    setColorScheme(nextIsDark: boolean) {
      currentIsDark = nextIsDark
      parent.dataset.compioTheme = nextIsDark ? 'dark' : 'light'
      reconfigureEditorTheme(view, nextIsDark)
      syncPortaledToolbarTheme(portaledToolbar)
    },
    destroy() {
      view.destroy()
      parent.classList.remove('compio-editor')
      delete parent.dataset.compioTheme
    },
  }
}
