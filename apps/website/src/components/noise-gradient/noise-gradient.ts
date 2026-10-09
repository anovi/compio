// Shared scroll-driven gradient renderer for every NoiseGradient instance.
const COLOR_STOPS = [
  [0, [209, 182, 254]],
  [0.165, [255, 145, 105]],
  [0.87, [255, 196, 122]],
  [1, [255, 226, 169]],
] as const

const RENDER_SCALE = 0.25
const SCROLL_SMOOTHING_MS = 260
const FRAME_INTERVAL_MS = 1000 / 30

function smoothStep(value: number): number {
  return value * value * (3 - 2 * value)
}

function randomAt(x: number, y: number): number {
  let value = (x * 374761393 + y * 668265263) | 0
  value = Math.imul(value ^ (value >>> 13), 1274126177)
  value ^= value >>> 16
  return (value >>> 0) / 4294967296
}

function valueNoise(x: number, y: number): number {
  const x0 = Math.floor(x)
  const y0 = Math.floor(y)
  const xMix = smoothStep(x - x0)
  const yMix = smoothStep(y - y0)
  const top = randomAt(x0, y0) * (1 - xMix) + randomAt(x0 + 1, y0) * xMix
  const bottom = randomAt(x0, y0 + 1) * (1 - xMix) + randomAt(x0 + 1, y0 + 1) * xMix

  return top * (1 - yMix) + bottom * yMix
}

function fractalNoise(x: number, y: number): number {
  const first = valueNoise(x, y) * 0.5
  const second = valueNoise(x * 2.03 + 17.13, y * 2.03 + 9.71) * 0.25

  return (first + second) * 1.25
}

function colorAt(position: number): readonly number[] {
  const clamped = Math.min(1, Math.max(0, smoothStep(position)))

  for (let index = 1; index < COLOR_STOPS.length; index += 1) {
    const [endPosition, endColor] = COLOR_STOPS[index]
    if (clamped > endPosition) continue

    const [startPosition, startColor] = COLOR_STOPS[index - 1]
    const mix = (clamped - startPosition) / (endPosition - startPosition)

    return startColor.map((channel, channelIndex) => (
      channel + (endColor[channelIndex] - channel) * mix
    ))
  }

  return COLOR_STOPS.at(-1)?.[1] ?? [255, 226, 169]
}

function documentProgress(): number {
  const maximum = document.documentElement.scrollHeight - window.innerHeight
  return maximum > 0 ? Math.min(1, Math.max(0, window.scrollY / maximum)) : 0
}

function initializeGradient(canvas: HTMLCanvasElement): () => void {
  const drawingContext = canvas.getContext('2d')
  if (!drawingContext) return () => undefined
  const context: CanvasRenderingContext2D = drawingContext

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  let width = 0
  let height = 0
  let targetProgress = documentProgress()
  let displayedProgress = targetProgress
  let animationFrame = 0
  let lastFrameTime = -1
  let visible = true
  let needsRender = true

  function resize() {
    const bounds = canvas.getBoundingClientRect()
    const nextWidth = Math.max(2, Math.round(bounds.width * RENDER_SCALE))
    const nextHeight = Math.max(2, Math.round(bounds.height * RENDER_SCALE))
    if (nextWidth === width && nextHeight === height) return

    width = nextWidth
    height = nextHeight
    canvas.width = width
    canvas.height = height
    needsRender = true
  }

  function render(time: number) {
    if (!width || !height) return

    const image = context.createImageData(width, height)
    const aspectRatio = width / height
    const travel = displayedProgress * 0.5
    const wave = reducedMotion.matches ? 0 : time * 0.000006

    for (let y = 0; y < height; y += 1) {
      const vertical = y / height

      for (let x = 0; x < width; x += 1) {
        const horizontal = x / width
        const noise = fractalNoise(
          horizontal * 1.5 * aspectRatio + wave,
          vertical * 1.5 + 7919,
        )
        const fineNoise = randomAt(x, y + 7919) - 0.5
        const gradientPosition = vertical * 0.5 + travel + (noise - 0.47) * 0.17 + fineNoise * 0.006
        const color = colorAt(gradientPosition)
        const offset = (y * width + x) * 4

        image.data[offset] = color[0]
        image.data[offset + 1] = color[1]
        image.data[offset + 2] = color[2]
        image.data[offset + 3] = 255
      }
    }

    context.putImageData(image, 0, 0)
  }

  function tick(time: number) {
    animationFrame = 0
    if (!visible) return

    const elapsed = lastFrameTime < 0 ? FRAME_INTERVAL_MS : Math.min(time - lastFrameTime, 250)
    const difference = targetProgress - displayedProgress
    displayedProgress += reducedMotion.matches
      ? difference
      : difference * (1 - Math.exp(-elapsed / SCROLL_SMOOTHING_MS))

    if (Math.abs(targetProgress - displayedProgress) < 0.0004) {
      displayedProgress = targetProgress
    }

    if (needsRender || time - lastFrameTime >= FRAME_INTERVAL_MS) {
      render(time)
      needsRender = false
      lastFrameTime = time
    }

    if (!reducedMotion.matches || displayedProgress !== targetProgress || needsRender) {
      animationFrame = requestAnimationFrame(tick)
    }
  }

  function start() {
    if (!animationFrame && visible) animationFrame = requestAnimationFrame(tick)
  }

  function handleScroll() {
    targetProgress = documentProgress()
    start()
  }

  function handleMotionPreferenceChange() {
    needsRender = true
    start()
  }

  const resizeObserver = new ResizeObserver(() => {
    resize()
    start()
  })
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? false
    if (visible) {
      needsRender = true
      start()
    } else if (animationFrame) {
      cancelAnimationFrame(animationFrame)
      animationFrame = 0
    }
  })

  resize()
  resizeObserver.observe(canvas)
  intersectionObserver.observe(canvas)
  window.addEventListener('scroll', handleScroll, { passive: true })
  reducedMotion.addEventListener('change', handleMotionPreferenceChange)
  start()

  return () => {
    cancelAnimationFrame(animationFrame)
    resizeObserver.disconnect()
    intersectionObserver.disconnect()
    window.removeEventListener('scroll', handleScroll)
    reducedMotion.removeEventListener('change', handleMotionPreferenceChange)
  }
}

export function initializeNoiseGradients(): () => void {
  const cleanups = Array.from(
    document.querySelectorAll<HTMLCanvasElement>('[data-noise-gradient]'),
    initializeGradient,
  )

  return () => {
    for (const cleanup of cleanups) cleanup()
  }
}
