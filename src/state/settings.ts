import { useEffect, useState } from 'react'

export type Theme = 'system' | 'light' | 'dark'
export type TextSize = 's' | 'm' | 'l' | 'xl'

export interface Settings {
  theme: Theme
  textSize: TextSize
  contrast: boolean
  reduceMotion: boolean
  welcomeHidden: boolean
  /** The introduction overlay has been seen (shown automatically only on the first visit). */
  tourSeen: boolean
}

const KEY = 'bmc.settings.v1'
export const DEFAULT_SETTINGS: Settings = { theme: 'system', textSize: 'm', contrast: false, reduceMotion: false, welcomeHidden: false, tourSeen: false }
const SIZE_PX: Record<TextSize, number> = { s: 14, m: 16, l: 18, xl: 20 }

function load(): Settings {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '{}')
    return { ...DEFAULT_SETTINGS, ...raw }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(load)
  useEffect(() => {
    const html = document.documentElement
    if (settings.theme === 'system') html.removeAttribute('data-theme')
    else html.setAttribute('data-theme', settings.theme)
    html.toggleAttribute('data-contrast', settings.contrast)
    html.toggleAttribute('data-reduce-motion', settings.reduceMotion)
    html.style.fontSize = SIZE_PX[settings.textSize] + 'px'
    try {
      localStorage.setItem(KEY, JSON.stringify(settings))
    } catch {
      /* ignore */
    }
  }, [settings])
  const update = (patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch }))
  return [settings, update] as const
}
