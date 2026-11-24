import { useTranslation } from 'react-i18next'
import type { Settings, TextSize, Theme } from '../state/settings'
import { DEFAULT_SETTINGS } from '../state/settings'
import Modal from './Modal'
import Icon from './Icon'

interface Props {
  settings: Settings
  update: (p: Partial<Settings>) => void
  onClose: () => void
}

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)
const MOD = isMac ? '⌘' : 'Ctrl'

export default function SettingsDialog({ settings, update, onClose }: Props) {
  const { t } = useTranslation()
  const themes: { v: Theme; icon: string }[] = [
    { v: 'system', icon: 'monitor' },
    { v: 'light', icon: 'sun' },
    { v: 'dark', icon: 'moon' },
  ]
  const sizes: TextSize[] = ['s', 'm', 'l', 'xl']
  const shortcuts: [string, string][] = [
    [`${MOD} + Z`, t('settings.sc.undo')],
    [`${MOD} + Shift + Z`, t('settings.sc.redo')],
    ['Enter', t('settings.sc.newNote')],
    ['Backspace', t('settings.sc.deleteEmpty')],
    ['Alt + ↑ / ↓', t('settings.sc.move')],
    ['Esc', t('settings.sc.close')],
  ]

  return (
    <Modal onClose={onClose} labelledBy="set-title" className="narrow">
      <header className="dlg-head">
        <h2 id="set-title">{t('settings.title')}</h2>
        <button type="button" className="icon-btn" onClick={onClose} aria-label={t('guide.close')} autoFocus>
          <Icon name="x" size={18} />
        </button>
      </header>
      <div className="dlg-body settings">
        <fieldset>
          <legend>{t('settings.theme')}</legend>
          <div className="seg">
            {themes.map(({ v, icon }) => (
              <label key={v} className={settings.theme === v ? 'on' : ''}>
                <input type="radio" name="theme" value={v} checked={settings.theme === v} onChange={() => update({ theme: v })} />
                <Icon name={icon} size={16} /> {t(`settings.${v}`)}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>{t('settings.textSize')}</legend>
          <div className="seg">
            {sizes.map((s, i) => (
              <label key={s} className={settings.textSize === s ? 'on' : ''}>
                <input type="radio" name="size" value={s} checked={settings.textSize === s} onChange={() => update({ textSize: s })} />
                <span aria-hidden="true" style={{ fontSize: `${0.8 + i * 0.12}rem`, fontWeight: 700 }}>A</span> {t(`settings.sizes.${s}`)}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="switch">
          <input type="checkbox" role="switch" checked={settings.contrast} onChange={(e) => update({ contrast: e.target.checked })} />
          <span className="switch-ui" aria-hidden="true" />
          <span>
            <strong>{t('settings.contrast')}</strong>
            <small>{t('settings.contrastHelp')}</small>
          </span>
        </label>

        <label className="switch">
          <input type="checkbox" role="switch" checked={settings.reduceMotion} onChange={(e) => update({ reduceMotion: e.target.checked })} />
          <span className="switch-ui" aria-hidden="true" />
          <span>
            <strong>{t('settings.motion')}</strong>
            <small>{t('settings.motionHelp')}</small>
          </span>
        </label>

        <h3><Icon name="keyboard" size={16} /> {t('settings.shortcuts')}</h3>
        <dl className="shortcuts">
          {shortcuts.map(([k, d]) => (
            <div key={k}>
              <dt><kbd dir="ltr">{k}</kbd></dt>
              <dd>{d}</dd>
            </div>
          ))}
        </dl>

        <button type="button" className="btn ghost" onClick={() => update({ ...DEFAULT_SETTINGS, welcomeHidden: settings.welcomeHidden, tourSeen: settings.tourSeen })}>
          <Icon name="reset" size={16} /> {t('settings.reset')}
        </button>
      </div>
    </Modal>
  )
}
