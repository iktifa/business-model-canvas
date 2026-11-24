import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { BlockId, Note } from '../types'
import { isFilled, uid } from '../types'
import { BLOCK_BY_ID } from '../content/blocks'
import { useBoard } from '../state/ctx'
import { announce } from '../lib/announce'
import NoteItem, { DRAG_MIME } from './NoteItem'
import Icon from './Icon'

export default function Block({ id, notes }: { id: BlockId; notes: Note[] }) {
  const { t } = useTranslation()
  const { dispatch, requestFocus, content, openGuide } = useBoard()
  const meta = BLOCK_BY_ID[id]
  const text = content.blocks[id]
  const [over, setOver] = useState(false)
  const filled = isFilled(notes)

  const drop = (e: React.DragEvent, beforeId: string | null) => {
    const raw = e.dataTransfer.getData(DRAG_MIME)
    if (!raw) return
    e.preventDefault()
    e.stopPropagation()
    setOver(false)
    try {
      const { from, id: noteId } = JSON.parse(raw) as { from: BlockId; id: string }
      dispatch({ type: 'move', from, id: noteId, to: id, beforeId })
    } catch {
      /* ignore malformed drag data */
    }
  }

  const add = () => {
    const nid = uid()
    dispatch({ type: 'add', block: id, id: nid })
    requestFocus(nid)
    announce(t('a11y.noteAdded', { block: text.name }))
  }

  return (
    <section
      className={`block area-${id} g-${meta.group}${over ? ' drop-over' : ''}${filled ? ' is-filled' : ''}`}
      aria-labelledby={`h-${id}`}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes(DRAG_MIME)) {
          e.preventDefault()
          setOver(true)
        }
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver(false)
      }}
      onDrop={(e) => drop(e, null)}
    >
      <header className="block-head">
        <span className="block-icon" aria-hidden="true">
          <Icon name={meta.icon} size={18} />
        </span>
        <div className="block-titles">
          <h2 id={`h-${id}`}>{text.name}</h2>
          <p>{text.short}</p>
        </div>
        <span className="block-num" title={t('guide.order')}>
          {filled ? <Icon name="check" size={14} /> : meta.num}
          <span className="sr-only">{filled ? t('block.filled') : ''}</span>
        </span>
        <button type="button" className="icon-btn" onClick={() => openGuide(id)} aria-label={`${t('block.guide')}: ${text.name}`} title={t('block.guide')}>
          <Icon name="help" size={18} />
        </button>
      </header>
      <div className="notes" role="list" aria-label={t('block.notes', { count: notes.length })}>
        {notes.map((n, i) => (
          <div role="listitem" key={n.id}>
            <NoteItem block={id} note={n} index={i} total={notes.length} prevId={i > 0 ? notes[i - 1].id : null} onDropBefore={drop} />
          </div>
        ))}
        {notes.length === 0 && (
          <button type="button" className="empty" onClick={() => openGuide(id)}>
            <span>{t('block.empty')}</span>
            <em>{content.guidance[id].questions[0]}</em>
          </button>
        )}
      </div>
      <button type="button" id={`add-${id}`} className="add-btn" onClick={add}>
        <Icon name="plus" size={16} /> {t('block.add')}
        <span className="sr-only">: {text.name}</span>
      </button>
    </section>
  )
}
