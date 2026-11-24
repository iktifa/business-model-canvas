import { createContext, useContext } from 'react'
import type { Action } from './useCanvas'
import type { BlockId, Canvas, Lang } from '../types'
import type { LocaleContent } from '../content/schema'

export interface BoardCtx {
  canvas: Canvas
  dispatch: (a: Action) => void
  focus: { id: string; n: number } | null
  requestFocus: (id: string) => void
  lang: Lang
  content: LocaleContent
  openGuide: (b: BlockId) => void
}

export const Ctx = createContext<BoardCtx | null>(null)
export const useBoard = () => useContext(Ctx)!
