import type { BlockId } from '../types'
import type { ExampleId, TemplateId } from './catalog'
import type { Lens, LinkId } from './links'

export interface BlockText {
  /** Block title, e.g. "Customer Segments" */
  name: string
  /** One short question shown under the title, e.g. "Who do you serve?" */
  short: string
}

export interface GuidanceText {
  what: string
  questions: string[]
  mistakes: string[]
  examples: string[]
}

export interface CanvasText {
  title: string
  summary: string
  /** Note texts per block. Array lengths MUST match the colour strings in catalog.ts (examples) / be 2 per block (templates). */
  notes: Record<BlockId, string[]>
}

export interface TourText {
  /** Dialog title, e.g. "Introduction to the Business Model Canvas" */
  title: string
  /** Step 1: the philosophy */
  s1: { title: string; body: string; points: string[] }
  /** Step 2: the three lenses */
  s2: { title: string; body: string; lenses: Record<Lens, { name: string; question: string; text: string }> }
  /** Step 3: relationships between blocks */
  s3: { title: string; body: string; hint: string; links: Record<LinkId, string> }
  /** Step 4: how to work with the tool */
  s4: { title: string; body: string; steps: string[] }
}

export interface LocaleContent {
  tour: TourText
  blocks: Record<BlockId, BlockText>
  guidance: Record<BlockId, GuidanceText>
  /** Paragraph shown in the "How do I start?" panel */
  intro: string
  tips: string[]
  examples: Record<ExampleId, CanvasText>
  templates: Record<TemplateId, CanvasText>
}
