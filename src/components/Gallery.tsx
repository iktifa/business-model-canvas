import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BLOCK_IDS, type BlockId } from '../types'
import { colorAt, EXAMPLES, TEMPLATES, TEMPLATE_NOTES_PER_BLOCK, type Category } from '../content/catalog'
import { useBoard } from '../state/ctx'
import Modal from './Modal'
import Icon from './Icon'

export type Pick = { kind: 'blank' } | { kind: 'example'; id: string } | { kind: 'template'; id: string }
type Tab = 'templates' | 'examples'

interface Props {
  initialTab?: Tab
  hasWork: boolean
  onClose: () => void
  onChoose: (p: Pick) => void
  onImport: () => void
}

/** Tiny visual of a canvas: each block shows a bar per note, in note colours. */
function Thumb({ colors, hint }: { colors: Record<BlockId, string>; hint?: boolean }) {
  return (
    <div className={`thumb${hint ? ' hint' : ''}`} aria-hidden="true">
      {BLOCK_IDS.map((b) => (
        <div key={b} className={`area-${b}`}>
          {Array.from(colors[b]).map((_, i) => <i key={i} className={`c-${colorAt(colors[b], i)}`} />)}
        </div>
      ))}
    </div>
  )
}

const TEMPLATE_COLORS = Object.fromEntries(BLOCK_IDS.map((b) => [b, 'y'.repeat(TEMPLATE_NOTES_PER_BLOCK)])) as Record<BlockId, string>

export default function Gallery({ initialTab = 'templates', hasWork, onClose, onChoose, onImport }: Props) {
  const { t } = useTranslation()
  const { content } = useBoard()
  const [tab, setTab] = useState<Tab>(initialTab)
  const [cat, setCat] = useState<Category | 'all'>('all')
  const [pending, setPending] = useState<Pick | null>(null)

  const items = tab === 'templates' ? TEMPLATES : EXAMPLES
  const cats = useMemo(() => Array.from(new Set(items.map((i) => i.category))), [items])
  const shown = items.filter((i) => cat === 'all' || i.category === cat)
  const pick = (p: Pick) => (hasWork ? setPending(p) : onChoose(p))

  const switchTab = (next: Tab) => {
    setTab(next)
    setCat('all')
  }

  return (
    <Modal onClose={onClose} labelledBy="gal-title" className="wide">
      <header className="dlg-head">
        <h2 id="gal-title">{t('gallery.title')}</h2>
        <button type="button" className="icon-btn" onClick={onClose} aria-label={t('guide.close')} autoFocus>
          <Icon name="x" size={18} />
        </button>
      </header>

      {pending ? (
        <div className="dlg-body confirm">
          <p>{t('gallery.confirm')}</p>
          <div className="row">
            <button type="button" className="btn primary" autoFocus onClick={() => onChoose(pending)}>{t('gallery.yes')}</button>
            <button type="button" className="btn" onClick={() => setPending(null)}>{t('gallery.cancel')}</button>
          </div>
        </div>
      ) : (
        <div className="dlg-body">
          <div className="tabs" role="tablist" aria-label={t('gallery.title')}>
            {(['templates', 'examples'] as Tab[]).map((k) => (
              <button
                key={k}
                type="button"
                role="tab"
                id={`tab-${k}`}
                aria-selected={tab === k}
                aria-controls="gal-panel"
                tabIndex={tab === k ? 0 : -1}
                onClick={() => switchTab(k)}
                onKeyDown={(e) => {
                  if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
                    const other: Tab = k === 'templates' ? 'examples' : 'templates'
                    switchTab(other)
                    document.getElementById(`tab-${other}`)?.focus()
                  }
                }}
              >
                <Icon name={k === 'templates' ? 'template' : 'sparkles'} size={16} />
                {t(k === 'templates' ? 'gallery.tabTemplates' : 'gallery.tabExamples')}
              </button>
            ))}
          </div>

          <div id="gal-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
            <p className="help">{t(tab === 'templates' ? 'gallery.templatesHelp' : 'gallery.examplesHelp')}</p>
            <div className="chips" role="group" aria-label={t('gallery.all')}>
              {(['all', ...cats] as const).map((c) => (
                <button key={c} type="button" className={`chip${cat === c ? ' on' : ''}`} aria-pressed={cat === c} onClick={() => setCat(c)}>
                  {c === 'all' ? t('gallery.all') : t(`categories.${c}`)}
                </button>
              ))}
            </div>

            <ul className="cards">
              {tab === 'templates' && cat === 'all' && (
                <li>
                  <button type="button" className="card blank" onClick={() => pick({ kind: 'blank' })}>
                    <div className="thumb empty" aria-hidden="true"><Icon name="file-plus" size={28} /></div>
                    <strong>{t('gallery.blank')}</strong>
                    <span>{t('gallery.blankDesc')}</span>
                  </button>
                </li>
              )}
              {tab === 'templates' && cat === 'all' && (
                <li>
                  <button type="button" className="card blank" onClick={onImport}>
                    <div className="thumb empty" aria-hidden="true"><Icon name="folder" size={28} /></div>
                    <strong>{t('gallery.import')}</strong>
                    <span>{t('gallery.importDesc')}</span>
                  </button>
                </li>
              )}
              {shown.map((it) => {
                const text = tab === 'templates' ? content.templates[it.id as keyof typeof content.templates] : content.examples[it.id as keyof typeof content.examples]
                const colors = 'colors' in it ? it.colors : TEMPLATE_COLORS
                return (
                  <li key={it.id}>
                    <button type="button" className="card" onClick={() => pick({ kind: tab === 'templates' ? 'template' : 'example', id: it.id })}>
                      <Thumb colors={colors} hint={tab === 'templates'} />
                      <span className="card-title">
                        <span className="card-icon" aria-hidden="true"><Icon name={it.icon} size={16} /></span>
                        <strong>{text.title}</strong>
                      </span>
                      <span>{text.summary}</span>
                      <span className="tag">{t(`categories.${it.category}`)}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}
    </Modal>
  )
}
