import type { BlockId, Canvas, Lang } from '../types'
import { BLOCK_IDS, emptyNotes, today, uid } from '../types'
import { colorAt, EXAMPLES, type ExampleId, type TemplateId } from './catalog'
import { contentFor } from './locales'

export function exampleToCanvas(id: ExampleId, lang: Lang): Canvas {
  const meta = EXAMPLES.find((e) => e.id === id)!
  const text = contentFor(lang).examples[id]
  const notes = emptyNotes()
  for (const b of BLOCK_IDS) {
    notes[b] = text.notes[b].map((t, i) => ({ id: uid(), text: t, color: colorAt(meta.colors[b], i) }))
  }
  return { title: text.title, author: '', date: today(), version: '1', notes }
}

export function templateToCanvas(id: TemplateId, lang: Lang): Canvas {
  const text = contentFor(lang).templates[id]
  const notes = emptyNotes()
  for (const b of BLOCK_IDS as readonly BlockId[]) {
    notes[b] = text.notes[b].map((t) => ({ id: uid(), text: t, color: 'yellow' as const, hint: true }))
  }
  return { title: '', author: '', date: today(), version: '1', notes }
}
