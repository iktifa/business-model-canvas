import { useEffect, useRef, type ReactNode } from 'react'

interface Props {
  onClose: () => void
  labelledBy: string
  className?: string
  role?: 'dialog' | 'alertdialog'
  children: ReactNode
}

/**
 * Native <dialog> opened with showModal(): the browser traps focus, makes the page behind inert,
 * and closes on Escape. We restore focus to the element that opened it.
 */
export default function Modal({ onClose, labelledBy, className = '', role = 'dialog', children }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const closeRef = useRef(onClose)
  useEffect(() => {
    closeRef.current = onClose
  }, [onClose])

  useEffect(() => {
    const dlg = ref.current!
    const opener = document.activeElement as HTMLElement | null
    if (!dlg.open) dlg.showModal()
    return () => {
      if (dlg.open) dlg.close()
      opener?.focus?.()
    }
  }, [])

  return (
    <dialog
      ref={ref}
      className={`dlg ${className}`}
      role={role === 'alertdialog' ? 'alertdialog' : undefined}
      aria-labelledby={labelledBy}
      onCancel={(e) => {
        e.preventDefault()
        closeRef.current()
      }}
      onClick={(e) => {
        // Click on the backdrop (the dialog element itself, outside its content box) closes it.
        if (e.target === ref.current) closeRef.current()
      }}
    >
      <div className="dlg-inner">{children}</div>
    </dialog>
  )
}
