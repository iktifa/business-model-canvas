import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { BlockId, Canvas } from './types'
import { asLang, BLOCK_IDS, fieldDir, emptyCanvas, isFilled, LANG_NATIVE, LANGS, noteCount, sanitizeCanvas, uid } from './types'
import { BLOCKS, FILL_ORDER } from './content/blocks'
import { contentFor } from './content/locales'
import type { LocaleContent } from './content/schema'
import { exampleToCanvas, templateToCanvas } from './content/build'
import type { ExampleId, TemplateId } from './content/catalog'
import { useCanvas } from './state/useCanvas'
import { useSettings } from './state/settings'
import { Ctx, type BoardCtx } from './state/ctx'
import { clearHash, LONG_LINK, readSharedFromHash, shareUrl } from './lib/share'
import { announce, registerAnnouncer } from './lib/announce'
import Block from './components/Block'
import GuidanceDrawer from './components/GuidanceDrawer'
import Gallery, { type Pick } from './components/Gallery'
import SettingsDialog from './components/SettingsDialog'
import Tour from './components/Tour'
import ExportView from './components/ExportView'
import MenuButton from './components/MenuButton'
import Modal from './components/Modal'
import Icon from './components/Icon'

type Confirm = { msg: string; yes: string; onYes: () => void; onNo?: () => void } | null
type Toast = { msg: string; undo?: boolean } | null

export default function App() {
  const { t, i18n } = useTranslation()
  const lang = asLang(i18n.language) ?? 'en'
  const content = contentFor(lang)
  const { canvas, dispatch, undo, redo, canUndo, canRedo } = useCanvas()
  const [settings, updateSettings] = useSettings()
  const [focus, setFocus] = useState<{ id: string; n: number } | null>(null)
  const [guide, setGuide] = useState<BlockId | 'intro' | null>(null)
  const [gallery, setGallery] = useState<null | 'templates' | 'examples'>(null)
  const [showSettings, setShowSettings] = useState(false)
  // First visit: open the introduction, unless the visitor arrived through a shared-canvas link.
  const [showTour, setShowTour] = useState(() => !settings.tourSeen && !location.hash.startsWith('#c='))
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState<Toast>(null)
  const [confirm, setConfirm] = useState<Confirm>(null)
  const [live, setLive] = useState('')
  const [dragFile, setDragFile] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef(canvas)
  useEffect(() => {
    canvasRef.current = canvas
  }, [canvas])
  useEffect(() => registerAnnouncer(setLive), [])

  const requestFocus = useCallback((id: string) => setFocus((f) => ({ id, n: (f?.n ?? 0) + 1 })), [])

  const flash = useCallback((msg: string, withUndo = false) => {
    setToast({ msg, undo: withUndo })
    window.setTimeout(() => setToast((cur) => (cur?.msg === msg ? null : cur)), withUndo ? 7000 : 4500)
  }, [])

  const doUndo = useCallback(() => {
    undo()
    announce(t('a11y.undone'))
  }, [undo, t])
  const doRedo = useCallback(() => {
    redo()
    announce(t('a11y.redone'))
  }, [redo, t])

  /** Replace the whole canvas, with an Undo toast. */
  const replaceCanvas = useCallback(
    (c: Canvas) => {
      dispatch({ type: 'replace', canvas: c })
      flash(t('a11y.canvasLoaded'), true)
    },
    [dispatch, flash, t],
  )

  // Global keyboard shortcuts: undo / redo.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey) return
      const k = e.key.toLowerCase()
      if (k === 'z' && !e.shiftKey) {
        e.preventDefault()
        doUndo()
      } else if ((k === 'z' && e.shiftKey) || k === 'y') {
        e.preventDefault()
        doRedo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [doUndo, doRedo])

  // Open a shared canvas from the URL hash (#c=...).
  useEffect(() => {
    const check = () => {
      const shared = readSharedFromHash()
      if (!shared) return
      const load = () => {
        dispatch({ type: 'replace', canvas: shared })
        clearHash()
        flash(t('msg.loadedShared'))
      }
      if (noteCount(canvasRef.current) > 0) {
        setConfirm({ msg: t('msg.replaceShared'), yes: t('gallery.yes'), onYes: load, onNo: clearHash })
      } else load()
    }
    check()
    window.addEventListener('hashchange', check)
    return () => window.removeEventListener('hashchange', check)
    // Runs once on mount; later changes to `t` don't need a re-check.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    document.title = `${canvas.title ? canvas.title + ' · ' : ''}${t('appName')}`
  }, [canvas.title, t])

  const filled = useMemo(() => BLOCK_IDS.filter((b) => isFilled(canvas.notes[b])), [canvas])
  const nextBlock = FILL_ORDER.find((b) => !isFilled(canvas.notes[b])) ?? null
  const isEmpty = noteCount(canvas) === 0 && !canvas.title

  const changeLang = (l: string) => {
    i18n.changeLanguage(l)
    announce(i18n.getFixedT(l)('a11y.langChanged'))
  }

  const choose = (p: Pick) => {
    setGallery(null)
    if (p.kind === 'blank') replaceCanvas(emptyCanvas())
    else if (p.kind === 'example') replaceCanvas(exampleToCanvas(p.id as ExampleId, lang))
    else replaceCanvas(templateToCanvas(p.id as TemplateId, lang))
  }

  const copyShare = async () => {
    const url = shareUrl(canvas)
    try {
      await navigator.clipboard.writeText(url)
      flash(url.length > LONG_LINK ? t('msg.longLink') : t('msg.copied'))
    } catch {
      window.prompt(t('toolbar.share'), url)
    }
  }

  const runExport = async (kind: 'png' | 'a4' | 'a3' | 'json') => {
    setBusy(true)
    announce(t('msg.exporting'))
    try {
      const mod = await import('./lib/export')
      if (kind === 'json') mod.exportJson(canvas)
      else if (kind === 'png') await mod.exportPng(canvas, lang)
      else await mod.exportPdf(canvas, lang, kind)
      announce(t('msg.exported'))
    } catch (err) {
      console.error(err)
      flash(t('msg.exportFailed'))
    } finally {
      setBusy(false)
    }
  }

  const importFile = async (f: File) => {
    try {
      const c = sanitizeCanvas(JSON.parse(await f.text()))
      if (!c) throw new Error('invalid')
      replaceCanvas(c)
    } catch {
      flash(t('msg.badFile'))
    }
  }

  const importRef = useRef(importFile)
  useEffect(() => {
    importRef.current = importFile
  })
  const openFile = () => fileRef.current?.click()

  // Drag a downloaded .json file anywhere onto the page to open it.
  useEffect(() => {
    let depth = 0
    const hasFile = (e: DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes('Files')
    const enter = (e: DragEvent) => {
      if (!hasFile(e)) return
      depth++
      setDragFile(true)
    }
    const leave = (e: DragEvent) => {
      if (!hasFile(e)) return
      depth = Math.max(0, depth - 1)
      if (depth === 0) setDragFile(false)
    }
    const over = (e: DragEvent) => {
      if (hasFile(e)) e.preventDefault()
    }
    const drop = (e: DragEvent) => {
      if (!hasFile(e)) return
      e.preventDefault()
      depth = 0
      setDragFile(false)
      const f = e.dataTransfer?.files?.[0]
      if (f) importRef.current(f)
    }
    window.addEventListener('dragenter', enter)
    window.addEventListener('dragleave', leave)
    window.addEventListener('dragover', over)
    window.addEventListener('drop', drop)
    return () => {
      window.removeEventListener('dragenter', enter)
      window.removeEventListener('dragleave', leave)
      window.removeEventListener('dragover', over)
      window.removeEventListener('drop', drop)
    }
  }, [])

  const addFromGuide = (block: BlockId, text: string) => {
    dispatch({ type: 'add', block, text })
    const msg = t('guide.added', { block: content.blocks[block].name })
    flash(msg)
    announce(msg)
  }

  const startBlank = () => {
    updateSettings({ welcomeHidden: true })
    const id = uid()
    dispatch({ type: 'add', block: 'cs', id })
    requestFocus(id)
  }

  const closeTour = () => {
    setShowTour(false)
    if (!settings.tourSeen) updateSettings({ tourSeen: true })
  }

  const meta = (field: 'title' | 'author' | 'date' | 'version', value: string) => dispatch({ type: 'meta', field, value })

  const ctx: BoardCtx = { canvas, dispatch, focus, requestFocus, lang, content, openGuide: setGuide }

  return (
    <Ctx.Provider value={ctx}>
      <a className="skip" href="#board">{t('a11y.skip')}</a>
      <div className="app screen-only">
        <header className="topbar">
          <div className="brand">
            <span className="logo" aria-hidden="true"><LogoMark /></span>
            <div>
              <p className="brand-name">{t('appName')}</p>
              <p className="brand-tag">{t('tagline')}</p>
            </div>
          </div>

          <div className="toolbar" role="toolbar" aria-label={t('appName')}>
            <div className="tool-group">
              <button type="button" className="icon-btn" onClick={doUndo} disabled={!canUndo} aria-label={t('toolbar.undo')} title={`${t('toolbar.undo')} (Ctrl+Z)`}>
                <Icon name="undo" className="flip-rtl" />
              </button>
              <button type="button" className="icon-btn" onClick={doRedo} disabled={!canRedo} aria-label={t('toolbar.redo')} title={`${t('toolbar.redo')} (Ctrl+Shift+Z)`}>
                <Icon name="redo" className="flip-rtl" />
              </button>
            </div>
            <button type="button" className="btn" onClick={() => setGallery('templates')}>
              <Icon name="template" /><span className="lbl">{t('toolbar.gallery')}</span>
            </button>
            <button type="button" className="btn" onClick={() => setShowTour(true)}>
              <Icon name="lightbulb" /><span className="lbl">{t('toolbar.guide')}</span>
            </button>
            <button type="button" className="btn" onClick={copyShare}>
              <Icon name="link" /><span className="lbl">{t('toolbar.share')}</span>
            </button>
            <MenuButton
              label={t('toolbar.export')}
              className="btn primary"
              disabled={busy}
              items={[
                { label: t('toolbar.png'), icon: 'image', onSelect: () => runExport('png') },
                { label: t('toolbar.pdfA4'), icon: 'file-text', onSelect: () => runExport('a4') },
                { label: t('toolbar.pdfA3'), icon: 'file-text', onSelect: () => runExport('a3') },
                { label: t('toolbar.print'), icon: 'printer', onSelect: () => window.print() },
                { kind: 'sep' },
                { label: t('toolbar.json'), icon: 'file-down', onSelect: () => runExport('json') },
                { label: t('toolbar.import'), icon: 'folder', onSelect: openFile },
              ]}
            >
              <Icon name="download" /><span className="lbl">{busy ? t('msg.exporting') : t('toolbar.export')}</span>
            </MenuButton>
            <MenuButton
              label={t('toolbar.menu')}
              className="icon-btn"
              compact
              items={[
                {
                  label: t('toolbar.new'),
                  icon: 'file-plus',
                  onSelect: () => setConfirm({ msg: t('msg.confirmNew'), yes: t('gallery.yes'), onYes: () => replaceCanvas(emptyCanvas()) }),
                },
                { kind: 'sep' },
                { label: t('toolbar.json'), icon: 'file-down', onSelect: () => runExport('json') },
                { label: t('toolbar.import'), icon: 'folder', onSelect: openFile },
              ]}
            >
              <Icon name="more" />
            </MenuButton>
            <MenuButton
              label={t('toolbar.language')}
              className="btn"
              items={LANGS.map((l) => ({ label: LANG_NATIVE[l], lang: l, checked: l === lang, onSelect: () => changeLang(l) }))}
            >
              <Icon name="languages" /><span className="lbl" lang={lang}>{LANG_NATIVE[lang]}</span>
              <span className="sr-only">: {t('toolbar.language')}</span>
            </MenuButton>
            <button type="button" className="icon-btn" onClick={() => setShowSettings(true)} aria-label={t('toolbar.settings')} title={t('toolbar.settings')}>
              <Icon name="accessibility" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) importFile(f)
                e.target.value = ''
              }}
            />
          </div>
        </header>

        <main id="board" tabIndex={-1}>
          <h1 className="sr-only">{canvas.title || t('untitled')} · {t('appName')}</h1>
          <section className="docbar" aria-label={t('fields.title')}>
            <label className="title-field">
              <span className="sr-only">{t('fields.title')}</span>
              <input dir={fieldDir(lang)} value={canvas.title} placeholder={t('untitled')} onChange={(e) => meta('title', e.target.value)} />
            </label>
            <div className="meta-fields">
              <label>
                <span>{t('fields.author')}</span>
                <input dir={fieldDir(lang)} value={canvas.author} onChange={(e) => meta('author', e.target.value)} />
              </label>
              <label>
                <span>{t('fields.date')}</span>
                <input type="date" dir={fieldDir(lang)} value={canvas.date} onChange={(e) => meta('date', e.target.value)} />
              </label>
              <label className="narrow">
                <span>{t('fields.version')}</span>
                <input dir={fieldDir(lang)} value={canvas.version} onChange={(e) => meta('version', e.target.value)} />
              </label>
            </div>
            <Progress content={content} filled={filled} next={nextBlock} onNext={(b) => setGuide(b)} />
          </section>

          {isEmpty && !settings.welcomeHidden && (
            <section className="welcome" aria-labelledby="welcome-title">
              <div className="welcome-text">
                <h2 id="welcome-title">{t('welcome.title')}</h2>
                <p>{t('welcome.body')}</p>
              </div>
              <div className="welcome-actions">
                <button type="button" className="tile" onClick={() => setGallery('templates')}>
                  <Icon name="template" size={22} /> {t('welcome.template')}
                </button>
                <button type="button" className="tile" onClick={() => setGallery('examples')}>
                  <Icon name="sparkles" size={22} /> {t('welcome.example')}
                </button>
                <button type="button" className="tile" onClick={() => setShowTour(true)}>
                  <Icon name="lightbulb" size={22} /> {t('welcome.guide')}
                </button>
                <button type="button" className="tile" onClick={openFile}>
                  <Icon name="folder" size={22} /> {t('welcome.import')}
                </button>
                <button type="button" className="tile primary" onClick={startBlank}>
                  <Icon name="users" size={22} /> {t('welcome.blank')}
                </button>
              </div>
              <button type="button" className="icon-btn welcome-close" onClick={() => updateSettings({ welcomeHidden: true })} aria-label={t('welcome.dismiss')} title={t('welcome.dismiss')}>
                <Icon name="x" size={16} />
              </button>
            </section>
          )}

          <div className="legend" aria-hidden="true">
            {(['customers', 'offer', 'infrastructure', 'finances'] as const).map((g) => (
              <span key={g} className={`g-${g}`}><i />{t(`groups.${g}`)}</span>
            ))}
          </div>

          <div className="board">
            {BLOCKS.map((b) => <Block key={b.id} id={b.id} notes={canvas.notes[b.id]} />)}
          </div>
        </main>

        <footer className="footer">
          <span><Icon name="check" size={14} /> {t('msg.saved')} · {t('footer.privacy')}</span>
          <span dir="ltr">{t('footer.attribution')}</span>
        </footer>
      </div>

      {/* Print-only rendering (vector text, "Save as PDF" from the print dialog). */}
      <div className="print-only" aria-hidden="true">
        <ExportView canvas={canvas} lang={lang} />
      </div>

      {guide && <GuidanceDrawer block={guide} onClose={() => setGuide(null)} onPick={setGuide} onAddExample={addFromGuide} />}
      {gallery && <Gallery initialTab={gallery} hasWork={noteCount(canvas) > 0} onClose={() => setGallery(null)} onChoose={choose} onImport={() => { setGallery(null); openFile() }} />}
      {showTour && (
        <Tour
          onClose={closeTour}
          onTemplates={() => { closeTour(); setGallery('templates') }}
          onBlank={() => { closeTour(); startBlank() }}
          onGuide={() => { closeTour(); setGuide('intro') }}
        />
      )}
      {showSettings && <SettingsDialog settings={settings} update={updateSettings} onClose={() => setShowSettings(false)} />}
      {confirm && (
        <Modal
          role="alertdialog"
          labelledBy="confirm-msg"
          className="narrow"
          onClose={() => {
            confirm.onNo?.()
            setConfirm(null)
          }}
        >
          <div className="dlg-body confirm">
            <p id="confirm-msg">{confirm.msg}</p>
            <div className="row">
              <button type="button" className="btn primary" autoFocus onClick={() => { confirm.onYes(); setConfirm(null) }}>{confirm.yes}</button>
              <button type="button" className="btn" onClick={() => { confirm.onNo?.(); setConfirm(null) }}>{t('gallery.cancel')}</button>
            </div>
          </div>
        </Modal>
      )}

      {toast && (
        <div className="toast" role="status">
          <span>{toast.msg}</span>
          {toast.undo && (
            <button type="button" className="toast-btn" onClick={() => { doUndo(); setToast(null) }}>
              <Icon name="undo" size={14} className="flip-rtl" /> {t('msg.undo')}
            </button>
          )}
        </div>
      )}
      {dragFile && (
        <div className="drop-overlay" aria-hidden="true">
          <div><Icon name="folder" size={36} /><p>{t('msg.dropFile')}</p></div>
        </div>
      )}
      <div className="sr-only" aria-live="polite" aria-atomic="true">{live}</div>
    </Ctx.Provider>
  )
}

function Progress({ content, filled, next, onNext }: { content: LocaleContent; filled: BlockId[]; next: BlockId | null; onNext: (b: BlockId) => void }) {
  const { t } = useTranslation()
  const done = filled.length
  return (
    <div className="progress">
      <div className="progress-top">
        <span id="progress-label">{t('progress.label', { done })}</span>
        {next ? (
          <button type="button" className="link-btn" onClick={() => onNext(next)}>
            {t('progress.next', { block: content.blocks[next].name })}
            <Icon name="chevron-right" size={14} className="flip-rtl" />
          </button>
        ) : (
          <span className="progress-done">{t('progress.done')}</span>
        )}
      </div>
      <div className="progress-bar" role="progressbar" aria-labelledby="progress-label" aria-valuemin={0} aria-valuemax={9} aria-valuenow={done}>
        {FILL_ORDER.map((b) => (
          <i key={b} className={filled.includes(b) ? 'on' : ''} title={content.blocks[b].name} />
        ))}
      </div>
    </div>
  )
}

function LogoMark() {
  return (
    <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true" focusable="false">
      <g fill="currentColor">
        <rect x="3" y="4" width="6" height="16" rx="1.5" />
        <rect x="10.5" y="4" width="11" height="7.5" rx="1.5" />
        <rect x="10.5" y="12.5" width="11" height="7.5" rx="1.5" opacity=".7" />
        <rect x="23" y="4" width="6" height="16" rx="1.5" />
        <rect x="3" y="21.5" width="12.5" height="6.5" rx="1.5" opacity=".7" />
        <rect x="16.5" y="21.5" width="12.5" height="6.5" rx="1.5" />
      </g>
    </svg>
  )
}
