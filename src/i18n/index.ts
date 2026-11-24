import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ar from './ar.json'
import en from './en.json'
import es from './es.json'
import fr from './fr.json'
import tr from './tr.json'
import ur from './ur.json'
import { asLang, isRtl, LANGS, type Lang } from '../types'

const LANG_KEY = 'bmc.lang'

function initialLang(): Lang {
  try {
    const q = asLang(new URLSearchParams(location.search).get('lang'))
    if (q) return q
    const saved = asLang(localStorage.getItem(LANG_KEY))
    if (saved) return saved
  } catch {
    /* storage unavailable */
  }
  // First visit: use the browser language if we support it, otherwise Arabic.
  for (const l of navigator.languages ?? []) {
    const base = asLang(l.slice(0, 2).toLowerCase())
    if (base) return base
  }
  return 'ar'
}

export function applyDir(lang: Lang) {
  document.documentElement.lang = lang
  document.documentElement.dir = isRtl(lang) ? 'rtl' : 'ltr'
  try {
    localStorage.setItem(LANG_KEY, lang)
  } catch {
    /* ignore */
  }
}

const lang = initialLang()
i18n.use(initReactI18next).init({
  resources: { ar: { translation: ar }, en: { translation: en }, es: { translation: es }, fr: { translation: fr }, tr: { translation: tr }, ur: { translation: ur } },
  supportedLngs: [...LANGS],
  lng: lang,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})
applyDir(lang)
i18n.on('languageChanged', (l) => applyDir(asLang(l) ?? 'en'))

export default i18n
