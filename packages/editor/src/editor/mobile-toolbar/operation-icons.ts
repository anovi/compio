import type { IconName } from '@compio/web-ui'
import type { Operation } from './operations-dictionary'

export const OPERATION_ICON: Record<Operation, IconName> = {
  plus: 'plus',
  minus: 'minus',
  multiplication: 'times',
  division: 'div',
  exponent: 'exponent',
  euqal: 'equl',
  parentheses: 'parenthesis',
}
