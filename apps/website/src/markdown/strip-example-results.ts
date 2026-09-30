import { defineMdastPlugin, type PluginFactoryContext } from 'satteri'

const RESULT_SUFFIX = /[ \t]*→[^\r\n]*/g

const stripExampleResults = defineMdastPlugin({
  name: 'strip-compio-example-results',
  code(node, context) {
    if (node.lang !== 'text') return
    console.log('REPLACE MD for', context.fileURL)
    context.setProperty(node, 'value', node.value.replace(RESULT_SUFFIX, ''))
  },
})

/** Removes rendered result annotations from Compio examples before Markdown becomes HTML. */
export function stripUserManualResults({ fileURL }: PluginFactoryContext) {
  return fileURL?.pathname.endsWith('/user-manual.md') ? stripExampleResults : undefined
}
