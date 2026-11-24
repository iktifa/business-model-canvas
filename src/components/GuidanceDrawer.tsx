import { useTranslation } from 'react-i18next'
import type { BlockId } from '../types'
import { BLOCK_BY_ID, FILL_ORDER } from '../content/blocks'
import { useBoard } from '../state/ctx'
import Modal from './Modal'
import Icon from './Icon'

interface Props {
  block: BlockId | 'intro'
  onClose: () => void
  onPick: (id: BlockId | 'intro') => void
  onAddExample: (id: BlockId, text: string) => void
}

export default function GuidanceDrawer({ block, onClose, onPick, onAddExample }: Props) {
  const { t } = useTranslation()
  const { content } = useBoard()
  const meta = block === 'intro' ? null : BLOCK_BY_ID[block]
  const g = block === 'intro' ? null : content.guidance[block]
  const idx = block === 'intro' ? -1 : FILL_ORDER.indexOf(block)
  const prev = idx <= 0 ? 'intro' : FILL_ORDER[idx - 1]
  const next = idx < FILL_ORDER.length - 1 ? FILL_ORDER[idx + 1] : null

  return (
    <Modal onClose={onClose} labelledBy="drawer-title" className="drawer">
      <header className="dlg-head">
        <h2 id="drawer-title">
          {meta && <span className={`head-icon g-${meta.group}`}><Icon name={meta.icon} size={18} /></span>}
          {meta ? content.blocks[meta.id].name : t('guide.intro')}
        </h2>
        <button type="button" className="icon-btn" onClick={onClose} aria-label={t('guide.close')} autoFocus>
          <Icon name="x" size={18} />
        </button>
      </header>

      <nav className="steps" aria-label={t('guide.order')}>
        <ol>
          {FILL_ORDER.map((id, i) => (
            <li key={id}>
              <button type="button" className={id === block ? 'on' : ''} onClick={() => onPick(id)} aria-current={id === block ? 'step' : undefined}>
                <span className="step-n" aria-hidden="true">{i + 1}</span>
                {content.blocks[id].name}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <div className="dlg-body prose">
        {g && meta ? (
          <>
            <p className="lead">{g.what}</p>
            <h3>{t('guide.questions')}</h3>
            <ul className="qs">{g.questions.map((q) => <li key={q}>{q}</li>)}</ul>
            <h3>{t('guide.mistakes')}</h3>
            <ul className="warn">{g.mistakes.map((q) => <li key={q}>{q}</li>)}</ul>
            <h3>{t('guide.examples')}</h3>
            <ul className="ex">
              {g.examples.map((q) => (
                <li key={q}>
                  <span>{q}</span>
                  <button type="button" className="chip" onClick={() => onAddExample(meta.id, q)}>
                    <Icon name="plus" size={14} /> {t('guide.addExample')}
                    <span className="sr-only">: {q}</span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <p className="lead">{content.intro}</p>
            <h3>{t('guide.tips')}</h3>
            <ul className="qs">{content.tips.map((q) => <li key={q}>{q}</li>)}</ul>
          </>
        )}
      </div>

      <footer className="dlg-foot">
        {block !== 'intro' ? (
          <button type="button" className="btn ghost" onClick={() => onPick(prev)}>
            <Icon name="chevron-left" size={16} className="flip-rtl" /> {t('guide.prev')}
          </button>
        ) : <span />}
        {next && (
          <button type="button" className="btn primary" onClick={() => onPick(next)}>
            {block === 'intro' ? content.blocks[next].name : t('guide.next')} <Icon name="chevron-right" size={16} className="flip-rtl" />
          </button>
        )}
      </footer>
    </Modal>
  )
}
