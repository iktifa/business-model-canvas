// Validates that every locale matches the catalog shape. Run: node scripts/check-content.ts
import { readFileSync, readdirSync } from 'node:fs'
import { EXAMPLES, TEMPLATES, TEMPLATE_NOTES_PER_BLOCK } from '../src/content/catalog.ts'
import { BLOCK_IDS, LANGS } from '../src/types.ts'

let errors = 0
const enContent = (await import('../src/content/locales/en.ts')).default
/** Same keys and array lengths as the English reference. */
function sameShape(ref: any, val: any, path: string, lang: string) {
  if (Array.isArray(ref)) {
    if (!Array.isArray(val) || val.length !== ref.length) return fail(`${lang}: ${path} should be a list of ${ref.length}`)
    ref.forEach((r, i) => sameShape(r, val[i], `${path}[${i}]`, lang))
  } else if (ref && typeof ref === 'object') {
    if (!val || typeof val !== 'object') return fail(`${lang}: ${path} missing`)
    for (const k of Object.keys(ref)) sameShape(ref[k], val[k], `${path}.${k}`, lang)
    for (const k of Object.keys(val)) if (!(k in ref)) fail(`${lang}: ${path}.${k} is extra`)
  } else if (typeof val !== 'string' || !val.trim()) fail(`${lang}: ${path} empty`)
}
const fail = (m: string) => { errors++; console.error('✗ ' + m) }

const keys = (o: unknown, p = ''): string[] =>
  o && typeof o === 'object' && !Array.isArray(o)
    ? Object.entries(o).flatMap(([k, v]) => keys(v, p ? `${p}.${k}` : k))
    : [p]
const enUi = JSON.parse(readFileSync('src/i18n/en.json', 'utf8'))
const enKeys = new Set(keys(enUi))
const vars = (s: string) => (s.match(/\{\{\w+\}\}/g) ?? []).sort().join(',')
const get = (o: any, path: string) => path.split('.').reduce((a, k) => a?.[k], o)

for (const lang of LANGS) {
  // UI strings
  let ui: any
  try { ui = JSON.parse(readFileSync(`src/i18n/${lang}.json`, 'utf8')) } catch (e) { fail(`${lang}.json unreadable: ${e}`); continue }
  const k = new Set(keys(ui))
  for (const key of enKeys) {
    if (!k.has(key)) fail(`${lang}.json missing ${key}`)
    else if (vars(get(ui, key)) !== vars(get(enUi, key))) fail(`${lang}.json ${key}: placeholders differ`)
  }
  for (const key of k) if (!enKeys.has(key)) fail(`${lang}.json has extra key ${key}`)

  // Content
  let c: any
  try { c = (await import(`../src/content/locales/${lang}.ts`)).default } catch { fail(`${lang}.ts missing`); continue }
  for (const b of BLOCK_IDS) {
    if (!c.blocks?.[b]?.name) fail(`${lang}: blocks.${b}.name`)
    const g = c.guidance?.[b]
    if (!g?.what || !g.questions?.length || !g.mistakes?.length || !g.examples?.length) fail(`${lang}: guidance.${b} incomplete`)
  }
  if (!c.intro || !c.tips?.length) fail(`${lang}: intro/tips`)
  sameShape(enContent.tour, c.tour, 'tour', lang)
  for (const ex of EXAMPLES) {
    const t = c.examples?.[ex.id]
    if (!t?.title || !t.summary) { fail(`${lang}: examples.${ex.id} title/summary`); continue }
    for (const b of BLOCK_IDS) {
      const n = t.notes?.[b]?.length ?? 0
      if (n !== ex.colors[b].length) fail(`${lang}: examples.${ex.id}.${b} has ${n} notes, expected ${ex.colors[b].length}`)
    }
  }
  for (const tp of TEMPLATES) {
    const t = c.templates?.[tp.id]
    if (!t?.title || !t.summary) { fail(`${lang}: templates.${tp.id} title/summary`); continue }
    for (const b of BLOCK_IDS) {
      const n = t.notes?.[b]?.length ?? 0
      if (n !== TEMPLATE_NOTES_PER_BLOCK) fail(`${lang}: templates.${tp.id}.${b} has ${n} notes, expected ${TEMPLATE_NOTES_PER_BLOCK}`)
    }
  }
}
const extra = readdirSync('src/content/locales').filter((f) => f.endsWith('.ts') && f !== 'index.ts' && !LANGS.includes(f.slice(0, -3) as any))
if (extra.length) fail('unexpected locale files: ' + extra.join(', '))
console.log(errors ? `\n${errors} problem(s)` : '✓ all locales complete')
process.exit(errors ? 1 : 0)
