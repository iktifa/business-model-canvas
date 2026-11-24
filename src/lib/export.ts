import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
import { toPng } from 'html-to-image'
import type { Canvas, Lang } from '../types'
import { isRtl } from '../types'
import ExportView from '../components/ExportView'

const EXPORT_WIDTH = 1600

function fileBase(c: Canvas) {
  const name = (c.title || 'business-model-canvas').trim().replace(/[\\/:*?"<>|\s]+/g, '-').slice(0, 60)
  return `${name}-${c.date || new Date().toISOString().slice(0, 10)}`
}

/** Render the read-only export layout off-screen at a fixed desktop width and snapshot it. */
async function renderPng(c: Canvas, lang: Lang): Promise<{ dataUrl: string; w: number; h: number }> {
  const host = document.createElement('div')
  host.style.cssText = `position:fixed;top:0;left:-${EXPORT_WIDTH * 3}px;width:${EXPORT_WIDTH}px;pointer-events:none;`
  host.setAttribute('dir', isRtl(lang) ? 'rtl' : 'ltr')
  host.setAttribute('lang', lang)
  document.body.appendChild(host)
  const root = createRoot(host)
  try {
    flushSync(() => root.render(createElement(ExportView, { canvas: c, lang })))
    await document.fonts.ready
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
    const node = host.firstElementChild as HTMLElement
    const w = node.offsetWidth
    const h = node.offsetHeight
    const dataUrl = await toPng(node, { pixelRatio: 2, width: w, height: h, backgroundColor: '#ffffff', cacheBust: true })
    return { dataUrl, w, h }
  } finally {
    root.unmount()
    host.remove()
  }
}

function download(href: string, filename: string) {
  const a = document.createElement('a')
  a.href = href
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
}

export async function exportPng(c: Canvas, lang: Lang) {
  const { dataUrl } = await renderPng(c, lang)
  download(dataUrl, `${fileBase(c)}.png`)
}

export async function exportPdf(c: Canvas, lang: Lang, format: 'a4' | 'a3') {
  const [{ dataUrl, w, h }, { jsPDF }] = await Promise.all([renderPng(c, lang), import('jspdf')])
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format })
  const pw = pdf.internal.pageSize.getWidth()
  const ph = pdf.internal.pageSize.getHeight()
  const margin = 8
  const scale = Math.min((pw - margin * 2) / w, (ph - margin * 2) / h)
  const iw = w * scale
  const ih = h * scale
  pdf.setProperties({ title: c.title || 'Business Model Canvas', creator: 'BMC Builder' })
  pdf.addImage(dataUrl, 'PNG', (pw - iw) / 2, (ph - ih) / 2, iw, ih)
  pdf.save(`${fileBase(c)}.pdf`)
}

export function exportJson(c: Canvas) {
  const blob = new Blob([JSON.stringify(c, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  download(url, `${fileBase(c)}.json`)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
