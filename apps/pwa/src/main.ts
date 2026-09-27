import { registerSW } from 'virtual:pwa-register'
import { initializeRatesStore } from '@compio/calculator'
import '@compio/editor/styles.css'
import '@compio/web-ui/styles.css'

import { mountApp } from './app'
import { mountInstallPromptButton } from './pwa'

const root = document.querySelector<HTMLDivElement>('#editor')
if (!root) {
  throw new Error('#editor missing')
}

await mountApp(root)

registerSW({ immediate: true })
mountInstallPromptButton()

void initializeRatesStore()
