import LZString from 'lz-string'
import type { Canvas } from '../types'
import { BLOCK_IDS, sanitizeCanvas } from '../types'

const PREFIX = '#c='
export const LONG_LINK = 8000

/** Compact form: drop note ids to keep links short. */
export function encodeCanvas(c: Canvas): string {
  const compact = {
    title: c.title,
    author: c.author,
    date: c.date,
    version: c.version,
    notes: Object.fromEntries(BLOCK_IDS.map((id) => [id, c.notes[id].map((n) => ({ text: n.text, color: n.color }))])),
  }
  return LZString.compressToEncodedURIComponent(JSON.stringify(compact))
}

export function shareUrl(c: Canvas): string {
  const u = new URL(location.href)
  u.hash = PREFIX.slice(1) + encodeCanvas(c)
  return u.toString()
}

export function readSharedFromHash(): Canvas | null {
  if (!location.hash.startsWith(PREFIX)) return null
  try {
    const json = LZString.decompressFromEncodedURIComponent(location.hash.slice(PREFIX.length))
    return json ? sanitizeCanvas(JSON.parse(json)) : null
  } catch {
    return null
  }
}

export function clearHash() {
  history.replaceState(null, '', location.pathname + location.search)
}
