import type { BlockId, NoteColor } from '../types'

export type Category = 'food' | 'education' | 'tech' | 'retail' | 'services' | 'social' | 'health' | 'tourism'

/**
 * Note colours per block, one letter per note: y=yellow p=pink b=blue g=green v=purple.
 * Each locale's example note arrays must have exactly this many items.
 * Convention: one colour per customer segment, so readers can trace what serves whom.
 */
type ColorMap = Record<BlockId, string>

export const EXAMPLE_IDS = [
  'coffee', 'elearning', 'delivery', 'waqf', 'agency',
  'fashion', 'homekitchen', 'clinicsaas', 'gym', 'tourism',
] as const
export type ExampleId = (typeof EXAMPLE_IDS)[number]

export interface ExampleMeta {
  id: ExampleId
  icon: string // lucide icon name, see components/Icon.tsx
  category: Category
  colors: ColorMap
}

export const EXAMPLES: ExampleMeta[] = [
  { id: 'coffee', icon: 'coffee', category: 'food', colors: { cs: 'ybg', vp: 'yybg', ch: 'yyby', cr: 'yyb', rev: 'ybby', kr: 'yyyy', ka: 'yyy', kp: 'yyy', cost: 'yyyy' } },
  { id: 'elearning', icon: 'graduation', category: 'education', colors: { cs: 'ypb', vp: 'yypb', ch: 'yyb', cr: 'yyb', rev: 'pby', kr: 'yyy', ka: 'yyyy', kp: 'yyy', cost: 'yyyy' } },
  { id: 'delivery', icon: 'bike', category: 'tech', colors: { cs: 'ybg', vp: 'yybg', ch: 'yyb', cr: 'yyy', rev: 'ybyy', kr: 'yyy', ka: 'yyy', kp: 'yyy', cost: 'yyyy' } },
  { id: 'waqf', icon: 'sprout', category: 'social', colors: { cs: 'ypb', vp: 'ypb', ch: 'ypb', cr: 'ypb', rev: 'ppby', kr: 'yyyy', ka: 'yyyy', kp: 'yyy', cost: 'yyyy' } },
  { id: 'agency', icon: 'palette', category: 'services', colors: { cs: 'yy', vp: 'yyy', ch: 'yyy', cr: 'yy', rev: 'yyy', kr: 'yyy', ka: 'yyy', kp: 'yy', cost: 'yyy' } },
  { id: 'fashion', icon: 'shirt', category: 'retail', colors: { cs: 'yb', vp: 'yyyb', ch: 'yyyb', cr: 'yyy', rev: 'yyb', kr: 'yyy', ka: 'yyyy', kp: 'yyyy', cost: 'yyyy' } },
  { id: 'homekitchen', icon: 'chef', category: 'food', colors: { cs: 'ybg', vp: 'ybg', ch: 'yybg', cr: 'yyb', rev: 'ybg', kr: 'yyy', ka: 'yyy', kp: 'yyy', cost: 'yyy' } },
  { id: 'clinicsaas', icon: 'stethoscope', category: 'health', colors: { cs: 'yb', vp: 'yyyb', ch: 'yyy', cr: 'yyy', rev: 'yyb', kr: 'yyy', ka: 'yyyy', kp: 'yyy', cost: 'yyyy' } },
  { id: 'gym', icon: 'dumbbell', category: 'health', colors: { cs: 'ypb', vp: 'ypb', ch: 'yyb', cr: 'yyy', rev: 'yypb', kr: 'yyy', ka: 'yyy', kp: 'yyy', cost: 'yyyy' } },
  { id: 'tourism', icon: 'map', category: 'tourism', colors: { cs: 'ybg', vp: 'ybgy', ch: 'yyb', cr: 'yyy', rev: 'yybg', kr: 'yyy', ka: 'yyy', kp: 'yyyy', cost: 'yyyy' } },
]

export const TEMPLATE_IDS = ['startup', 'ecommerce', 'restaurant', 'service', 'nonprofit', 'marketplace'] as const
export type TemplateId = (typeof TEMPLATE_IDS)[number]

/** Templates: every block has exactly 2 prompt notes (hints). */
export const TEMPLATE_NOTES_PER_BLOCK = 2

export interface TemplateMeta {
  id: TemplateId
  icon: string
  category: Category
}

export const TEMPLATES: TemplateMeta[] = [
  { id: 'startup', icon: 'rocket', category: 'tech' },
  { id: 'ecommerce', icon: 'cart', category: 'retail' },
  { id: 'restaurant', icon: 'utensils', category: 'food' },
  { id: 'service', icon: 'briefcase', category: 'services' },
  { id: 'nonprofit', icon: 'heart', category: 'social' },
  { id: 'marketplace', icon: 'store', category: 'tech' },
]

const LETTER: Record<string, NoteColor> = { y: 'yellow', p: 'pink', b: 'blue', g: 'green', v: 'purple' }
export const colorAt = (s: string, i: number): NoteColor => LETTER[s[i]] ?? 'yellow'
