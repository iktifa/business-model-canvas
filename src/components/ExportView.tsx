import i18n from '../i18n'
import type { Canvas, Lang } from '../types'
import { fieldDir, isRtl } from '../types'
import { BLOCKS } from '../content/blocks'
import { contentFor } from '../content/locales'
import Icon from './Icon'

/** Static, read-only rendering used for PNG/PDF export and for printing. Template prompts (hints) are left out. */
export default function ExportView({ canvas, lang }: { canvas: Canvas; lang: Lang }) {
  const t = i18n.getFixedT(lang)
  const c = contentFor(lang)
  return (
    <div className="xv" dir={isRtl(lang) ? 'rtl' : 'ltr'} lang={lang}>
      <div className="xv-head">
        <div>
          <div className="xv-kicker">{t('appName')}</div>
          <div className="xv-title" dir={fieldDir(lang)}>{canvas.title || t('untitled')}</div>
        </div>
        <dl className="xv-meta">
          {canvas.author && (<div><dt>{t('fields.author')}</dt><dd dir={fieldDir(lang)}>{canvas.author}</dd></div>)}
          {canvas.date && (<div><dt>{t('fields.date')}</dt><dd>{canvas.date}</dd></div>)}
          {canvas.version && (<div><dt>{t('fields.version')}</dt><dd dir={fieldDir(lang)}>{canvas.version}</dd></div>)}
        </dl>
      </div>
      <div className="xv-grid">
        {BLOCKS.map((b) => (
          <section key={b.id} className={`xv-block area-${b.id} g-${b.group}`}>
            <h3><span className="xv-icon"><Icon name={b.icon} size={16} /></span>{c.blocks[b.id].name}</h3>
            <div className="xv-notes">
              {canvas.notes[b.id].filter((n) => !n.hint && n.text.trim()).map((n) => (
                <div key={n.id} dir={fieldDir(lang)} className={`xv-note c-${n.color}`}>{n.text}</div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
