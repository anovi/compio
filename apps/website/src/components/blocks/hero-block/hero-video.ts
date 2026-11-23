// Keeps a hero video, its chapter buttons and its play/pause toggle in sync.

/** Playback time after which the video zooms in, cropping the phone keyboard. It stays zoomed after that. */
const ZOOM_AFTER_SECONDS = 2

interface ChapterButton {
  element: HTMLButtonElement
  start: number
}

function initializeHeroVideo(figure: HTMLElement): () => void {
  const videoElement = figure.querySelector('video')
  if (!videoElement) return () => undefined

  const video: HTMLVideoElement = videoElement
  const toggle = figure.querySelector<HTMLButtonElement>('[data-hero-video-toggle]')

  const chapters: ChapterButton[] = Array.from(
    document.querySelectorAll<HTMLButtonElement>(`[data-hero-chapters="${CSS.escape(figure.id)}"] [data-start]`),
    (element) => ({ element, start: Number(element.dataset.start) || 0 }),
  ).sort((first, second) => first.start - second.start)

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  let animationFrame = 0
  let activeIndex = -1

  function sync() {
    if (chapters.length === 0) return

    const time = video.currentTime
    const duration = Number.isFinite(video.duration) ? video.duration : time
    let index = 0
    while (index < chapters.length - 1 && time >= chapters[index + 1].start) index += 1

    const start = chapters[index].start
    const end = index < chapters.length - 1 ? chapters[index + 1].start : duration
    const progress = end > start ? Math.min(1, Math.max(0, (time - start) / (end - start))) : 0

    if (index !== activeIndex) {
      chapters.forEach(({ element }, chapterIndex) => {
        if (chapterIndex === index) element.setAttribute('aria-current', 'true')
        else element.removeAttribute('aria-current')
        element.style.removeProperty('--chapter-progress')
      })
      activeIndex = index
    }

    chapters[index].element.style.setProperty('--chapter-progress', progress.toFixed(4))
  }

  function loop() {
    sync()
    animationFrame = video.paused ? 0 : requestAnimationFrame(loop)
  }

  function play() {
    video.play().catch(() => undefined)
  }

  function updateToggle() {
    if (!toggle) return
    toggle.toggleAttribute('data-playing', !video.paused)
    toggle.setAttribute('aria-label', video.paused ? 'Play video' : 'Pause video')
  }

  function handlePlay() {
    updateToggle()
    cancelAnimationFrame(animationFrame)
    animationFrame = requestAnimationFrame(loop)
  }

  function handlePause() {
    updateToggle()
    sync()
  }

  function zoomOnce() {
    if (video.currentTime < ZOOM_AFTER_SECONDS) return
    figure.toggleAttribute('data-zoomed', true)
    video.removeEventListener('timeupdate', zoomOnce)
  }

  function handleToggle() {
    if (video.paused) play()
    else video.pause()
  }

  const chapterHandlers = chapters.map(({ element, start }) => {
    const handler = () => {
      video.currentTime = start + 0.01
      sync()
      play()
    }
    element.addEventListener('click', handler)
    return () => element.removeEventListener('click', handler)
  })

  video.addEventListener('play', handlePlay)
  video.addEventListener('pause', handlePause)
  video.addEventListener('seeked', sync)
  video.addEventListener('timeupdate', sync)
  video.addEventListener('timeupdate', zoomOnce)
  toggle?.addEventListener('click', handleToggle)
  if (toggle) toggle.hidden = false

  video.muted = true
  updateToggle()
  sync()
  if (!reducedMotion.matches) play()

  return () => {
    cancelAnimationFrame(animationFrame)
    for (const removeHandler of chapterHandlers) removeHandler()
    video.removeEventListener('play', handlePlay)
    video.removeEventListener('pause', handlePause)
    video.removeEventListener('seeked', sync)
    video.removeEventListener('timeupdate', sync)
    video.removeEventListener('timeupdate', zoomOnce)
    toggle?.removeEventListener('click', handleToggle)
  }
}

export function initializeHeroVideos(): () => void {
  const cleanups = Array.from(
    document.querySelectorAll<HTMLElement>('[data-hero-video]'),
    initializeHeroVideo,
  )

  return () => {
    for (const cleanup of cleanups) cleanup()
  }
}
