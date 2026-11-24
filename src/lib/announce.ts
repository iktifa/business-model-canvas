/** Screen-reader announcements through a single polite live region (rendered in App). */
let setter: ((msg: string) => void) | null = null

export function registerAnnouncer(fn: (msg: string) => void) {
  setter = fn
}

export function announce(msg: string) {
  // Clear first so repeating the same message is still announced.
  setter?.('')
  window.setTimeout(() => setter?.(msg), 50)
}
