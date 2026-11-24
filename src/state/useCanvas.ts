import { useEffect, useReducer } from 'react'
import type { BlockId, Canvas, NoteColor } from '../types'
import { emptyCanvas, sanitizeCanvas, uid } from '../types'

const STORE_KEY = 'bmc.canvas.v1'
const HISTORY_LIMIT = 100
const COALESCE_MS = 1200

export type Action =
  | { type: 'replace'; canvas: Canvas }
  | { type: 'meta'; field: 'title' | 'author' | 'date' | 'version'; value: string }
  | { type: 'add'; block: BlockId; text?: string; color?: NoteColor; id?: string; afterId?: string }
  | { type: 'edit'; block: BlockId; id: string; text: string }
  | { type: 'color'; block: BlockId; id: string; color: NoteColor }
  | { type: 'delete'; block: BlockId; id: string }
  | { type: 'move'; from: BlockId; id: string; to: BlockId; beforeId: string | null }
  | { type: 'shift'; block: BlockId; id: string; delta: -1 | 1 }

type HistAction = Action | { type: 'undo' } | { type: 'redo' }

interface Hist {
  past: Canvas[]
  present: Canvas
  future: Canvas[]
  lastKey: string | null
  lastTime: number
}

function apply(s: Canvas, a: Action): Canvas {
  switch (a.type) {
    case 'replace':
      return a.canvas
    case 'meta':
      return { ...s, [a.field]: a.value }
    case 'add': {
      const note = { id: a.id ?? uid(), text: a.text ?? '', color: a.color ?? 'yellow' }
      const list = [...s.notes[a.block]]
      const idx = a.afterId ? list.findIndex((n) => n.id === a.afterId) : -1
      list.splice(idx < 0 ? list.length : idx + 1, 0, note)
      return { ...s, notes: { ...s.notes, [a.block]: list } }
    }
    case 'edit':
      return {
        ...s,
        notes: { ...s.notes, [a.block]: s.notes[a.block].map((n) => (n.id === a.id ? { id: n.id, color: n.color, text: a.text } : n)) },
      }
    case 'color':
      return { ...s, notes: { ...s.notes, [a.block]: s.notes[a.block].map((n) => (n.id === a.id ? { ...n, color: a.color } : n)) } }
    case 'delete':
      return { ...s, notes: { ...s.notes, [a.block]: s.notes[a.block].filter((n) => n.id !== a.id) } }
    case 'move': {
      const note = s.notes[a.from].find((n) => n.id === a.id)
      if (!note || a.beforeId === a.id) return s
      const notes = { ...s.notes, [a.from]: s.notes[a.from].filter((n) => n.id !== a.id) }
      const target = [...notes[a.to]]
      const idx = a.beforeId ? target.findIndex((n) => n.id === a.beforeId) : -1
      target.splice(idx < 0 ? target.length : idx, 0, note)
      notes[a.to] = target
      return { ...s, notes }
    }
    case 'shift': {
      const list = [...s.notes[a.block]]
      const i = list.findIndex((n) => n.id === a.id)
      const j = i + a.delta
      if (i < 0 || j < 0 || j >= list.length) return s
      ;[list[i], list[j]] = [list[j], list[i]]
      return { ...s, notes: { ...s.notes, [a.block]: list } }
    }
  }
}

/** Typing in the same field within a short window counts as one undo step. */
const coalesceKey = (a: Action) => (a.type === 'edit' ? `edit:${a.id}` : a.type === 'meta' ? `meta:${a.field}` : null)

function reducer(h: Hist, a: HistAction): Hist {
  if (a.type === 'undo') {
    if (!h.past.length) return h
    return { past: h.past.slice(0, -1), present: h.past[h.past.length - 1], future: [h.present, ...h.future], lastKey: null, lastTime: 0 }
  }
  if (a.type === 'redo') {
    if (!h.future.length) return h
    return { past: [...h.past, h.present], present: h.future[0], future: h.future.slice(1), lastKey: null, lastTime: 0 }
  }
  const next = apply(h.present, a)
  if (next === h.present) return h
  const key = coalesceKey(a)
  const now = Date.now()
  if (key && key === h.lastKey && now - h.lastTime < COALESCE_MS) {
    return { ...h, present: next, future: [], lastTime: now }
  }
  return { past: [...h.past, h.present].slice(-HISTORY_LIMIT), present: next, future: [], lastKey: key, lastTime: now }
}

function load(): Hist {
  let present = emptyCanvas()
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (raw) present = sanitizeCanvas(JSON.parse(raw)) ?? present
  } catch {
    /* ignore */
  }
  return { past: [], present, future: [], lastKey: null, lastTime: 0 }
}

export function useCanvas() {
  const [h, dispatch] = useReducer(reducer, undefined, load)
  useEffect(() => {
    const save = () => {
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(h.present))
      } catch {
        /* ignore */
      }
    }
    // Debounced while typing, but always flushed when the page is hidden or closed.
    const t = setTimeout(save, 300)
    window.addEventListener('pagehide', save)
    return () => {
      clearTimeout(t)
      window.removeEventListener('pagehide', save)
    }
  }, [h.present])
  return {
    canvas: h.present,
    dispatch: dispatch as (a: Action) => void,
    undo: () => dispatch({ type: 'undo' }),
    redo: () => dispatch({ type: 'redo' }),
    canUndo: h.past.length > 0,
    canRedo: h.future.length > 0,
  }
}
