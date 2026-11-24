import { useTranslation } from 'react-i18next'
import type { BlockId } from '../types'
import { BLOCK_IDS, isRtl } from '../types'
import { BLOCK_BY_ID, FILL_ORDER } from '../content/blocks'
import { EDGES, LENS_OF, type Lens } from '../content/links'
import { useBoard } from '../state/ctx'
import Icon from './Icon'

/*
 * A spaced-out version of the canvas: nodes sit where the blocks sit on the real canvas,
 * with room between them for arrows. Coordinates use a 1000 × 560 box (LTR); RTL mirrors x.
 */
const W = 1000
const H = 560
const NODE_W = 172
const NODE_H = 72
const POS: Record<BlockId, [number, number]> = {
  kp: [95, 200],
  ka: [300, 85],
  kr: [300, 315],
  vp: [500, 200],
  cr: [700, 85],
  ch: [700, 315],
  cs: [905, 200],
  cost: [250, 480],
  rev: [750, 480],
}
/** Optional curve control points (LTR) for edges that would otherwise cross a node. */
const CURVE: Partial<Record<string, [number, number]>> = {
  'ka-cost': [165, 330],
  'kp-cost': [95, 420],
  'cs-rev': [905, 420],
  'rev-cost': [500, 545],
}

type Pt = [number, number]

/** Point where the segment from the node centre towards `toward` leaves the node's rectangle. */
function exitPoint(center: Pt, toward: Pt, pad = 6): Pt {
  const dx = toward[0] - center[0]
  const dy = toward[1] - center[1]
  const hw = NODE_W / 2 + pad
  const hh = NODE_H / 2 + pad
  const s = Math.min(dx ? hw / Math.abs(dx) : Infinity, dy ? hh / Math.abs(dy) : Infinity)
  return [center[0] + dx * s, center[1] + dy * s]
}

interface Props {
  mode: 'plain' | 'lenses' | 'links'
  selected?: BlockId | null
  onSelect?: (b: BlockId | null) => void
  lens?: Lens | null
}

export default function CanvasDiagram({ mode, selected = null, onSelect, lens = null }: Props) {
  const { t } = useTranslation()
  const { content, lang } = useBoard()
  const rtl = isRtl(lang)
  const fx = (x: number) => (rtl ? W - x : x)
  const pos = (b: BlockId): Pt => [fx(POS[b][0]), POS[b][1]]

  const related = new Set<BlockId>()
  if (selected) {
    related.add(selected)
    for (const e of EDGES) if (e.from === selected || e.to === selected) related.add(e.from).add(e.to)
  }

  const nodeState = (b: BlockId) => {
    if (mode === 'lenses' && lens) return LENS_OF[b] === lens ? 'on' : 'dim'
    if (mode === 'links' && selected) return b === selected ? 'sel' : related.has(b) ? 'on' : 'dim'
    return ''
  }

  return (
    <div className={`dgm mode-${mode}`} role="group" aria-label={t('tour.diagram')}>
      {mode === 'links' && (
        <svg className="dgm-lines" viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
          <defs>
            <marker id="dgm-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="context-stroke" />
            </marker>
          </defs>
          {EDGES.map((e) => {
            const a = pos(e.from)
            const b = pos(e.to)
            const c0 = CURVE[`${e.from}-${e.to}`]
            const c: Pt | null = c0 ? [fx(c0[0]), c0[1]] : null
            const p1 = exitPoint(a, c ?? b)
            const p2 = exitPoint(b, c ?? a, 10)
            const d = c ? `M${p1[0]},${p1[1]} Q${c[0]},${c[1]} ${p2[0]},${p2[1]}` : `M${p1[0]},${p1[1]} L${p2[0]},${p2[1]}`
            const active = selected && (e.from === selected || e.to === selected)
            const cls = !selected ? '' : active ? 'on' : 'dim'
            return <path key={`${e.from}-${e.to}`} d={d} className={`edge ${cls} l-${LENS_OF[e.to]}`} markerEnd="url(#dgm-arrow)" />
          })}
        </svg>
      )}
      {BLOCK_IDS.map((b) => {
        const [x, y] = pos(b)
        const style = {
          left: `${(x / W) * 100}%`,
          top: `${(y / H) * 100}%`,
          width: `${(NODE_W / W) * 100}%`,
          height: `${(NODE_H / H) * 100}%`,
        }
        const inner = (
          <>
            <span className="dgm-icon" aria-hidden="true"><Icon name={BLOCK_BY_ID[b].icon} size={15} /></span>
            <span className="dgm-name">{content.blocks[b].name}</span>
            {mode === 'plain' && <span className="dgm-num" aria-hidden="true">{FILL_ORDER.indexOf(b) + 1}</span>}
          </>
        )
        const cls = `dgm-node lens-${LENS_OF[b]} ${nodeState(b)}`
        return onSelect ? (
          <button
            key={b}
            type="button"
            className={cls}
            style={style}
            aria-pressed={selected === b}
            onClick={() => onSelect(selected === b ? null : b)}
          >
            {inner}
          </button>
        ) : (
          <div key={b} className={cls} style={style}>{inner}</div>
        )
      })}
    </div>
  )
}
