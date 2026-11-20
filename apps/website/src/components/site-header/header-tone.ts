/**
 * Switches headers marked with `data-inverse-over` between the inverse tone
 * (while the header overlaps the referenced section) and the default tone.
 * Returns a cleanup function.
 */
export function initializeHeaderTone(): () => void {
  const pairs = [...document.querySelectorAll<HTMLElement>('[data-inverse-over]')].flatMap((header) => {
    const section = document.getElementById(header.dataset.inverseOver ?? '')
    return section ? [{ header, section }] : []
  })

  if (pairs.length === 0) return () => {}

  let frame = 0

  function update() {
    frame = 0
    for (const { header, section } of pairs) {
      const overSection = section.getBoundingClientRect().bottom > header.offsetHeight
      header.classList.toggle('site-header--inverse', overSection)
    }
  }

  function scheduleUpdate() {
    if (frame === 0) frame = requestAnimationFrame(update)
  }

  update()
  window.addEventListener('scroll', scheduleUpdate, { passive: true })
  window.addEventListener('resize', scheduleUpdate)

  return () => {
    cancelAnimationFrame(frame)
    window.removeEventListener('scroll', scheduleUpdate)
    window.removeEventListener('resize', scheduleUpdate)
  }
}
