export const LANGS = ['ar', 'en', 'fr', 'es', 'tr', 'ur'] as const
export type Lang = (typeof LANGS)[number]
export const RTL_LANGS: readonly Lang[] = ['ar', 'ur']
export const isRtl = (l: Lang) => RTL_LANGS.includes(l)
/** Text direction for user-entered fields: always RTL in RTL interfaces, content-based otherwise. */
export const fieldDir = (l: Lang): 'rtl' | 'auto' => (isRtl(l) ? 'rtl' : 'auto')
export const LANG_NATIVE: Record<Lang, string> = {
  ar: 'العربية',
  en: 'English',
  fr: 'Français',
  es: 'Español',
  tr: 'Türkçe',
  ur: 'اردو',
}
export const asLang = (v: unknown): Lang | null => (LANGS.includes(v as Lang) ? (v as Lang) : null)

export const BLOCK_IDS = ['kp', 'ka', 'kr', 'vp', 'cr', 'ch', 'cs', 'cost', 'rev'] as const
export type BlockId = (typeof BLOCK_IDS)[number]

export const NOTE_COLORS = ['yellow', 'pink', 'blue', 'green', 'purple'] as const
export type NoteColor = (typeof NOTE_COLORS)[number]

export interface Note {
  id: string
  text: string
  color: NoteColor
  /** Template prompt: shown as a placeholder-style note, skipped in exports, cleared on first edit. */
  hint?: boolean
}

export interface Canvas {
  title: string
  author: string
  date: string
  version: string
  notes: Record<BlockId, Note[]>
}

export const uid = () => Math.random().toString(36).slice(2, 10)

export const emptyNotes = (): Record<BlockId, Note[]> =>
  Object.fromEntries(BLOCK_IDS.map((id) => [id, []])) as unknown as Record<BlockId, Note[]>

export const today = () => new Date().toISOString().slice(0, 10)

export const emptyCanvas = (): Canvas => ({ title: '', author: '', date: today(), version: '1', notes: emptyNotes() })

export const noteCount = (c: Canvas) => BLOCK_IDS.reduce((n, id) => n + c.notes[id].length, 0)

/** A block counts as filled when it has at least one real (non-hint, non-empty) note. */
export const isFilled = (notes: Note[]) => notes.some((n) => !n.hint && n.text.trim() !== '')

/** Validate and normalise untrusted input (share links, uploaded JSON). */
export function sanitizeCanvas(raw: unknown): Canvas | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const str = (v: unknown, max = 200) => (typeof v === 'string' ? v.slice(0, max) : '')
  const notes = emptyNotes()
  const rn = (r.notes ?? {}) as Record<string, unknown>
  for (const id of BLOCK_IDS) {
    const list = Array.isArray(rn[id]) ? (rn[id] as unknown[]) : []
    notes[id] = list.slice(0, 60).flatMap((n) => {
      if (!n || typeof n !== 'object') return []
      const o = n as Record<string, unknown>
      const color = NOTE_COLORS.includes(o.color as NoteColor) ? (o.color as NoteColor) : 'yellow'
      return [{ id: uid(), text: str(o.text, 1000), color, ...(o.hint === true ? { hint: true } : {}) }]
    })
  }
  return { title: str(r.title), author: str(r.author), date: str(r.date, 20), version: str(r.version, 20), notes }
}
