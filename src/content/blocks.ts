import type { BlockId } from '../types'

export type Group = 'infrastructure' | 'offer' | 'customers' | 'finances'

export interface BlockMeta {
  id: BlockId
  /** Position in the suggested fill order (1 = first). */
  num: number
  icon: string
  group: Group
}

// DOM / tab order follows the classic Strategyzer layout reading order.
export const BLOCKS: BlockMeta[] = [
  { id: 'kp', num: 8, icon: 'handshake', group: 'infrastructure' },
  { id: 'ka', num: 7, icon: 'cog', group: 'infrastructure' },
  { id: 'kr', num: 6, icon: 'boxes', group: 'infrastructure' },
  { id: 'vp', num: 2, icon: 'gift', group: 'offer' },
  { id: 'cr', num: 4, icon: 'messages', group: 'customers' },
  { id: 'ch', num: 3, icon: 'truck', group: 'customers' },
  { id: 'cs', num: 1, icon: 'users', group: 'customers' },
  { id: 'cost', num: 9, icon: 'receipt', group: 'finances' },
  { id: 'rev', num: 5, icon: 'coins', group: 'finances' },
]

export const BLOCK_BY_ID = Object.fromEntries(BLOCKS.map((b) => [b.id, b])) as Record<BlockId, BlockMeta>

/** Recommended fill order (customer first), as taught by Strategyzer. */
export const FILL_ORDER: BlockId[] = ['cs', 'vp', 'ch', 'cr', 'rev', 'kr', 'ka', 'kp', 'cost']
