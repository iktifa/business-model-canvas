import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { BlockId, Note } from '../types'
import { fieldDir, NOTE_COLORS, uid } from '../types'
import { BLOCKS } from '../content/blocks'
import { useBoard } from '../state/ctx'
import { announce } from '../lib/announce'
import Icon from './Icon'
import MenuButton, { type MenuItem } from './MenuButton'

export const DRAG_MIME = 'application/x-bmc-note'

interface Props {
  block: BlockId
  note: Note
  index: number
  total: number
  prevId: string | null
  onDropBefore: (e: React.DragEvent, beforeId: string) => void
}

export default function NoteItem({ block, note, index, total, prevId, onDropBefore }: Props) {
  const { t } = useTranslation()
  const { dispatch, focus, requestFocus, content, canvas, lang } = useBoard()
  const ref = useRef<HTMLTextAreaElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const [over, setOver] = useState(false)
  const value = note.hint ? '' : note.text

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [value, note.hint])

  useEffect(() => {
    if (focus?.id === note.id) ref.current?.focus()
  }, [focus, note.id])

  const blockName = (b: BlockId) => content.blocks[b].name

  const shift = (delta: -1 | 1) => {
    const pos = index + delta
    if (pos < 0 || pos >= total) return
    dispatch({ type: 'shift', block, id: note.id, delta })
    requestFocus(note.id)
    announce(t('a11y.noteMoved', { block: blockName(block), pos: pos + 1 }))
  }

  const remove = () => {
    dispatch({ type: 'delete', block, id: note.id })
    if (prevId) requestFocus(prevId)
    else document.getElementById(`add-${block}`)?.focus()
    announce(t('a11y.noteDeleted'))
  }

  const moveTo = (to: BlockId) => {
    dispatch({ type: 'move', from: block, id: note.id, to, beforeId: null })
    requestFocus(note.id)
    announce(t('a11y.noteMoved', { block: blockName(to), pos: canvas.notes[to].length + 1 }))
  }

  const actions: MenuItem[] = [
    { label: t('note.moveUp'), icon: 'arrow-up', onSelect: () => shift(-1), disabled: index === 0 },
    { label: t('note.moveDown'), icon: 'arrow-down', onSelect: () => shift(1), disabled: index === total - 1 },
    { kind: 'sep' },
    { kind: 'label', label: t('note.moveTo') },
    ...BLOCKS.filter((b) => b.id !== block).map((b) => ({ label: blockName(b.id), icon: b.icon, onSelect: () => moveTo(b.id) })),
    { kind: 'sep' },
    { label: t('note.delete'), icon: 'trash', onSelect: remove },
  ]

  const colors: MenuItem[] = NOTE_COLORS.map((c) => ({
    label: t(`colors.${c}`),
    icon: `swatch:${c}`,
    checked: c === note.color,
    onSelect: () => dispatch({ type: 'color', block, id: note.id, color: c }),
  }))

  return (
    <div
      ref={rootRef}
      className={`note c-${note.color}${note.hint ? ' hint' : ''}${over ? ' drop-before' : ''}`}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes(DRAG_MIME)) {
          e.preventDefault()
          e.stopPropagation()
          setOver(true)
        }
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        setOver(false)
        onDropBefore(e, note.id)
      }}
    >
      <span
        className="note-handle"
        draggable
        title={t('note.drag')}
        aria-hidden="true"
        onDragStart={(e) => {
          e.dataTransfer.setData(DRAG_MIME, JSON.stringify({ from: block, id: note.id }))
          e.dataTransfer.effectAllowed = 'move'
          if (rootRef.current) e.dataTransfer.setDragImage(rootRef.current, 16, 16)
        }}
      >
        <Icon name="grip" size={14} />
      </span>
      <textarea
        ref={ref}
        id={`note-${note.id}`}
        rows={1}
        dir={fieldDir(lang)}
        value={value}
        placeholder={note.hint ? note.text : t('note.placeholder')}
        aria-label={note.hint ? `${blockName(block)}: ${t('note.hint')} ${note.text}` : `${blockName(block)} ${index + 1}/${total}`}
        onChange={(e) => dispatch({ type: 'edit', block, id: note.id, text: e.target.value })}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault()
            const id = uid()
            dispatch({ type: 'add', block, color: note.color, id, afterId: note.id })
            requestFocus(id)
          } else if (e.key === 'Backspace' && value === '') {
            e.preventDefault()
            remove()
          } else if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
            e.preventDefault()
            shift(e.key === 'ArrowUp' ? -1 : 1)
          }
        }}
      />
      <div className="note-tools">
        <MenuButton label={t('note.color')} items={colors} className="tool-btn" compact>
          <span className={`dot c-${note.color}`} aria-hidden="true" />
        </MenuButton>
        <MenuButton label={t('note.actions')} items={actions} className="tool-btn" compact>
          <Icon name="more" size={16} />
        </MenuButton>
      </div>
    </div>
  )
}
