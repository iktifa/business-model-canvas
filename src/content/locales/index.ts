import type { Lang } from '../../types'
import type { LocaleContent } from '../schema'
import ar from './ar'
import en from './en'
import es from './es'
import fr from './fr'
import tr from './tr'
import ur from './ur'

export const CONTENT: Record<Lang, LocaleContent> = { ar, en, es, fr, tr, ur }
export const contentFor = (lang: Lang): LocaleContent => CONTENT[lang] ?? en
