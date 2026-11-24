import type { BlockId } from '../types'

/** Relationships between blocks shown in the introduction diagram. Text lives in each locale under tour.s3.links. */
export const LINK_IDS = ['cs_vp', 'vp_ch', 'ch_cs', 'cr_cs', 'cs_rev', 'ka_vp', 'kr_vp', 'kp_ka', 'kp_kr', 'infra_cost', 'rev_cost'] as const
export type LinkId = (typeof LINK_IDS)[number]

export interface Edge {
  from: BlockId
  to: BlockId
  link: LinkId
}

/** Arrows point in the direction value (or money) flows. */
export const EDGES: Edge[] = [
  { from: 'vp', to: 'cs', link: 'cs_vp' },
  { from: 'vp', to: 'ch', link: 'vp_ch' },
  { from: 'ch', to: 'cs', link: 'ch_cs' },
  { from: 'cr', to: 'cs', link: 'cr_cs' },
  { from: 'cs', to: 'rev', link: 'cs_rev' },
  { from: 'ka', to: 'vp', link: 'ka_vp' },
  { from: 'kr', to: 'vp', link: 'kr_vp' },
  { from: 'kp', to: 'ka', link: 'kp_ka' },
  { from: 'kp', to: 'kr', link: 'kp_kr' },
  { from: 'ka', to: 'cost', link: 'infra_cost' },
  { from: 'kr', to: 'cost', link: 'infra_cost' },
  { from: 'kp', to: 'cost', link: 'infra_cost' },
  { from: 'rev', to: 'cost', link: 'rev_cost' },
]

export type Lens = 'desirability' | 'feasibility' | 'viability'
export const LENS_OF: Record<BlockId, Lens> = {
  cs: 'desirability', vp: 'desirability', ch: 'desirability', cr: 'desirability',
  kp: 'feasibility', ka: 'feasibility', kr: 'feasibility',
  rev: 'viability', cost: 'viability',
}
