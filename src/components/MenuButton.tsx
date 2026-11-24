import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import Icon from './Icon'

export type MenuItem =
  | { kind?: 'item'; label: string; icon?: string; onSelect: () => void; checked?: boolean; lang?: string; disabled?: boolean }
  | { kind: 'sep' }
  | { kind: 'label'; label: string }

interface Props {
  label: string
  children: ReactNode
  items: MenuItem[]
  className?: string
  align?: 'start' | 'end'
  disabled?: boolean
  /** Hide the visible text on small screens but keep it for assistive tech. */
  compact?: boolean
}

export default function MenuButton({ label, children, items, className = 'btn', align = 'end', disabled, compact }: Props) {
  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const id = useId()

  const focusables = () => Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('[role^="menuitem"]:not([disabled])') ?? [])

  useEffect(() => {
    if (!open) return
    const checked = menuRef.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]')
    ;(checked ?? focusables()[0])?.focus()
    const onDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node) && !btnRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  const close = (refocus = true) => {
    setOpen(false)
    if (refocus) btnRef.current?.focus()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    const list = focusables()
    const i = list.indexOf(document.activeElement as HTMLButtonElement)
    if (e.key === 'ArrowDown') { e.preventDefault(); list[(i + 1) % list.length]?.focus() }
    else if (e.key === 'ArrowUp') { e.preventDefault(); list[(i - 1 + list.length) % list.length]?.focus() }
    else if (e.key === 'Home') { e.preventDefault(); list[0]?.focus() }
    else if (e.key === 'End') { e.preventDefault(); list[list.length - 1]?.focus() }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close() }
    else if (e.key === 'Tab') close(false)
  }

  return (
    <div className="menu-wrap">
      <button
        ref={btnRef}
        type="button"
        className={className + (compact ? ' compact' : '')}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        aria-label={compact ? label : undefined}
        title={compact ? label : undefined}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' && !open) { e.preventDefault(); setOpen(true) }
        }}
      >
        {children}
      </button>
      {open && (
        <div ref={menuRef} id={id} className={`menu align-${align}`} role="menu" aria-label={label} onKeyDown={onKeyDown}>
          {items.map((it, i) => {
            if (it.kind === 'sep') return <hr key={i} role="separator" />
            if (it.kind === 'label') return <div key={i} className="menu-label" role="presentation">{it.label}</div>
            const radio = it.checked !== undefined
            return (
              <button
                key={i}
                type="button"
                role={radio ? 'menuitemradio' : 'menuitem'}
                aria-checked={radio ? it.checked : undefined}
                lang={it.lang}
                disabled={it.disabled}
                tabIndex={-1}
                onClick={() => {
                  close()
                  it.onSelect()
                }}
              >
                {it.icon?.startsWith('swatch:') ? <span className={`dot c-${it.icon.slice(7)}`} aria-hidden="true" /> : it.icon && <Icon name={it.icon} size={16} />}
                <span>{it.label}</span>
                {it.checked && <Icon name="check" size={16} className="menu-check" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
