import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { BlockId } from '../types'
import { EDGES, type Lens, type LinkId } from '../content/links'
import { useBoard } from '../state/ctx'
import Modal from './Modal'
import Icon from './Icon'
import CanvasDiagram from './CanvasDiagram'

interface Props {
  onClose: () => void
  onTemplates: () => void
  onBlank: () => void
  onGuide: () => void
}

const LENSES: Lens[] = ['desirability', 'feasibility', 'viability']
const LENS_ICON: Record<Lens, string> = { desirability: 'heart', feasibility: 'cog', viability: 'coins' }
const TOTAL = 4

export default function Tour({ onClose, onTemplates, onBlank, onGuide }: Props) {
  const { t } = useTranslation()
  const { content } = useBoard()
  const tour = content.tour
  const [step, setStep] = useState(0)
  const [lens, setLens] = useState<Lens | null>(null)
  const [selected, setSelected] = useState<BlockId | null>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const first = useRef(true)

  // Move focus to the new step's heading so screen readers read it (not on first open: the close button gets focus).
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    headingRef.current?.focus()
  }, [step])

  const go = (n: number) => {
    setStep(Math.max(0, Math.min(TOTAL - 1, n)))
    setLens(null)
    setSelected(null)
  }

  const selectedLinks: LinkId[] = selected
    ? Array.from(new Set(EDGES.filter((e) => e.from === selected || e.to === selected).map((e) => e.link)))
    : []

  const titles = [tour.s1.title, tour.s2.title, tour.s3.title, tour.s4.title]

  return (
    <Modal onClose={onClose} labelledBy="tour-title" className="tour">
      <header className="dlg-head tour-head">
        <p id="tour-title" className="tour-kicker">
          <Icon name="lightbulb" size={16} /> {tour.title}
        </p>
        <button type="button" className="btn ghost tour-skip" onClick={onClose}>
          {t('tour.skip')} <Icon name="x" size={16} />
        </button>
      </header>

      <div className="dlg-body tour-body">
        <div className="tour-text">
          <p className="tour-step-label">{t('tour.step', { n: step + 1, total: TOTAL })}</p>
          <h2 ref={headingRef} tabIndex={-1}>{titles[step]}</h2>

          {step === 0 && (
            <>
              <p className="tour-lead">{tour.s1.body}</p>
              <ul className="tour-points">
                {tour.s1.points.map((p) => (
                  <li key={p}><Icon name="check" size={16} /> <span>{p}</span></li>
                ))}
              </ul>
            </>
          )}

          {step === 1 && (
            <>
              <p className="tour-lead">{tour.s2.body}</p>
              <div className="lens-list">
                {LENSES.map((l) => (
                  <button
                    key={l}
                    type="button"
                    className={`lens-card lens-${l}${lens === l ? ' on' : ''}`}
                    aria-pressed={lens === l}
                    onClick={() => setLens(lens === l ? null : l)}
                    onMouseEnter={() => setLens(l)}
                  >
                    <span className="lens-icon" aria-hidden="true"><Icon name={LENS_ICON[l]} size={18} /></span>
                    <span>
                      <strong>{tour.s2.lenses[l].name}</strong>
                      <em>{tour.s2.lenses[l].question}</em>
                      <small>{tour.s2.lenses[l].text}</small>
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <p className="tour-lead">{tour.s3.body}</p>
              <div className="link-panel" aria-live="polite">
                {selected ? (
                  <>
                    <h3>{t('tour.selected', { block: content.blocks[selected].name })}</h3>
                    <ul>
                      {selectedLinks.map((id) => <li key={id}>{tour.s3.links[id]}</li>)}
                    </ul>
                    <button type="button" className="link-btn" onClick={() => setSelected(null)}>{t('tour.all')}</button>
                  </>
                ) : (
                  <p className="hint-line"><Icon name="sparkles" size={16} /> {tour.s3.hint}</p>
                )}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <p className="tour-lead">{tour.s4.body}</p>
              <ol className="tour-steps">
                {tour.s4.steps.map((s, i) => (
                  <li key={s}><span className="step-n" aria-hidden="true">{i + 1}</span><span>{s}</span></li>
                ))}
              </ol>
              <div className="tour-cta">
                <button type="button" className="btn primary" onClick={onTemplates}><Icon name="template" size={16} /> {t('tour.template')}</button>
                <button type="button" className="btn" onClick={onBlank}><Icon name="file-plus" size={16} /> {t('tour.blank')}</button>
                <button type="button" className="link-btn" onClick={onGuide}>{t('tour.guide')}</button>
              </div>
            </>
          )}
        </div>

        <div className="tour-visual">
          <div className="dgm-scroll">
            <CanvasDiagram
              mode={step === 1 ? 'lenses' : step === 2 ? 'links' : 'plain'}
              lens={lens}
              selected={selected}
              onSelect={step === 2 ? setSelected : undefined}
            />
          </div>
        </div>
      </div>

      <footer className="dlg-foot tour-foot">
        <button type="button" className="btn ghost" onClick={() => go(step - 1)} disabled={step === 0}>
          <Icon name="chevron-left" size={16} className="flip-rtl" /> {t('tour.back')}
        </button>
        <ol className="tour-dots">
          {titles.map((title, i) => (
            <li key={i}>
              <button
                type="button"
                className={i === step ? 'on' : ''}
                aria-current={i === step ? 'step' : undefined}
                aria-label={`${t('tour.step', { n: i + 1, total: TOTAL })}: ${title}`}
                title={title}
                onClick={() => go(i)}
              />
            </li>
          ))}
        </ol>
        {step < TOTAL - 1 ? (
          <button type="button" className="btn primary" onClick={() => go(step + 1)}>
            {t('tour.next')} <Icon name="chevron-right" size={16} className="flip-rtl" />
          </button>
        ) : (
          <button type="button" className="btn primary" onClick={onClose}>
            {t('guide.close')}
          </button>
        )}
      </footer>
    </Modal>
  )
}
