import { initializeRatesStore } from '@compio/calculator'
import { createEditor } from '@compio/editor'
import '@compio/editor/styles.css'
import './website-styles.css'

const arithmeticRoot = document.querySelector('#arithmetic-editor')
const currencyRoot = document.querySelector('#currency-editor')

if (!(arithmeticRoot instanceof HTMLElement) || !(currencyRoot instanceof HTMLElement)) {
  throw new Error('Embedded editor containers are missing')
}

const colorScheme = window.matchMedia('(prefers-color-scheme: dark)')
const isDark = colorScheme.matches
document.documentElement.dataset.theme = isDark ? 'dark' : 'light'

const editors = [
  createEditor({
    parent: arithmeticRoot,
    isDark,
    doc: `groceries = 48.50
coffee = 4.25
groceries + coffee

distance = 10 km
distance in mi`,
  }),
  createEditor({
    parent: currencyRoot,
    isDark,
    doc: `monthly = 4_200 EUR
rent = 1_450 EUR
utilities = 185 EUR
left = monthly - rent - utilities
left in USD`,
  }),
]

void initializeRatesStore()

function syncColorScheme(event) {
  document.documentElement.dataset.theme = event.matches ? 'dark' : 'light'
  for (const editor of editors) editor.setColorScheme(event.matches)
}

colorScheme.addEventListener('change', syncColorScheme)

window.addEventListener('pagehide', () => {
  colorScheme.removeEventListener('change', syncColorScheme)
  for (const editor of editors) editor.destroy()
}, { once: true })
