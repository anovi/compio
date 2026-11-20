// Dappled sunlight: soft light patches swaying around their own anchors, mostly
// sideways. All patches share one rhythm, but each runs a little early or late
// (and that lag drifts), and every swing picks new end points, a new size and
// a new brightness, so the motion never repeats exactly.

const LIGHT_COLOR = [255, 251, 196] as const
const PATCH_COUNT = 75
const SEED = 127
const DEPTH = 0.65 // share of the height that receives light
const ASPECT = 3.5 // patches are taller than wide
const SIZE_VARIATION = 1
const ASPECT_VARIATION = 0.35
const TILT_DEGREES = 5
const SCALE = 1.1
const SWAY = 1.4
const SPEED = 3
const SWING_SECONDS = 5.4 // one side-to-side swing
const LAG_SECONDS = 1.5 // how early or late each patch runs
const REACH_VARIATION = 0.45 // how much each swing's end points vary
const VERTICAL = 1 // share of up-and-down movement
const BREATH = 0.8 // size change per swing
const FLICKER = 0.28 // brightness variation

const RENDER_WIDTH = 360
const FRAME_INTERVAL_MS = 1000 / 30

interface Patch {
  id: number
  x: number
  y: number
  radiusX: number
  radiusY: number
  rotation: number
  brightness: number
  amplitude: number
}

function hash(index: number, step: number, salt: number): number {
  const value = Math.sin(index * 127.1 + step * 311.7 + salt * 74.7) * 43758.5453
  return value - Math.floor(value)
}

/** Smooth 1-D value noise in [0, 1], independent for every patch. */
function valueNoise(index: number, salt: number, x: number): number {
  const step = Math.floor(x)
  const fraction = x - step
  const eased = fraction * fraction * (3 - 2 * fraction)
  const start = hash(index, step, salt)
  return start + (hash(index, step + 1, salt) - start) * eased
}

function ease(value: number): number {
  return (1 - Math.cos(Math.PI * value)) / 2
}

function lerp(start: number, end: number, amount: number): number {
  return start + (end - start) * amount
}

function createPatches(): Patch[] {
  let seed = (SEED * 2654435761) % 2147483647 || 1
  const random = () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
  const dim = Math.min(1, Math.sqrt(40 / PATCH_COUNT))

  return Array.from({ length: PATCH_COUNT }, (_, index) => {
    const y = DEPTH * Math.pow(random(), 1.5) // more patches near the top, where light enters
    const x = -0.04 + random() * 1.08
    const radiusX = Math.max(0.006, 0.026 * (1 + (random() * 2 - 1) * SIZE_VARIATION * 0.75))
    const radiusY = radiusX * ASPECT * Math.max(0.3, 1 + (random() * 2 - 1) * ASPECT_VARIATION * 0.6)
    const rotation = (random() * 2 - 1) * TILT_DEGREES * Math.PI / 180
    const fade = Math.pow(Math.max(0, 1 - y / (DEPTH * 1.15)), 1.3)

    return {
      id: index + SEED * 1000,
      x,
      y,
      radiusX,
      radiusY,
      rotation,
      brightness: (0.35 + random() * 0.65) * fade * dim,
      amplitude: 0.007 + random() * 0.014,
    }
  })
}

function draw(context: CanvasRenderingContext2D, patches: Patch[], time: number) {
  const { width, height } = context.canvas
  const [red, green, blue] = LIGHT_COLOR

  context.setTransform(1, 0, 0, 1, 0, 0)
  context.globalCompositeOperation = 'source-over'
  context.clearRect(0, 0, width, height)
  context.globalCompositeOperation = 'lighter'

  for (const patch of patches) {
    const lag = (valueNoise(patch.id, 1, time * 0.3) - 0.5) * 2 * LAG_SECONDS
    const phase = (time + lag) / SWING_SECONDS
    const swing = Math.floor(phase)
    const progress = ease(phase - swing)
    const side = (step: number) => ((step & 1) ? 1 : -1) * (1 - REACH_VARIATION + REACH_VARIATION * hash(patch.id, step, 2))
    const offsetX = lerp(side(swing), side(swing + 1), progress) * patch.amplitude * SWAY
    const offsetY = lerp(hash(patch.id, swing, 3) - 0.5, hash(patch.id, swing + 1, 3) - 0.5, progress) * patch.amplitude * VERTICAL * SWAY
    const stretchX = 1 + (lerp(hash(patch.id, swing, 4), hash(patch.id, swing + 1, 4), progress) - 0.5) * BREATH
    const stretchY = 1 + (lerp(hash(patch.id, swing, 5), hash(patch.id, swing + 1, 5), progress) - 0.5) * BREATH
    const brightness = patch.brightness * (1 - FLICKER + FLICKER * valueNoise(patch.id, 6, time * 0.22))

    const centerX = (patch.x + offsetX) * width
    const centerY = patch.y * height + offsetY * width
    const radiusX = patch.radiusX * width * SCALE * stretchX
    const radiusY = patch.radiusY * width * SCALE * stretchY
    const cos = Math.cos(patch.rotation)
    const sin = Math.sin(patch.rotation)

    context.setTransform(cos * radiusX, sin * radiusX, -sin * radiusY, cos * radiusY, centerX, centerY)
    const gradient = context.createRadialGradient(0, 0, 0, 0, 0, 1)
    gradient.addColorStop(0, `rgb(${red} ${green} ${blue} / ${brightness.toFixed(3)})`)
    gradient.addColorStop(0.5, `rgb(${red} ${green} ${blue} / ${(brightness * 0.55).toFixed(3)})`)
    gradient.addColorStop(1, `rgb(${red} ${green} ${blue} / 0)`)
    context.fillStyle = gradient
    context.beginPath()
    context.arc(0, 0, 1, 0, Math.PI * 2)
    context.fill()
  }

  context.setTransform(1, 0, 0, 1, 0, 0)
  context.globalCompositeOperation = 'source-over'
}

function initializeSunlight(canvas: HTMLCanvasElement): () => void {
  const drawingContext = canvas.getContext('2d')
  if (!drawingContext) return () => undefined
  const context: CanvasRenderingContext2D = drawingContext

  const patches = createPatches()
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  let animationFrame = 0
  let lastFrameTime = 0
  let time = 0
  let visible = true

  function resize() {
    const bounds = canvas.getBoundingClientRect()
    const height = Math.max(60, Math.round(RENDER_WIDTH * bounds.height / (bounds.width || 1)))
    if (canvas.width === RENDER_WIDTH && canvas.height === height) return

    canvas.width = RENDER_WIDTH
    canvas.height = height
    draw(context, patches, time)
  }

  function tick(now: number) {
    animationFrame = 0
    if (!visible || reducedMotion.matches) return

    if (now - lastFrameTime >= FRAME_INTERVAL_MS) {
      const elapsed = lastFrameTime ? Math.min(0.1, (now - lastFrameTime) / 1000) : 0
      lastFrameTime = now
      time += elapsed * SPEED
      draw(context, patches, time)
    }

    animationFrame = requestAnimationFrame(tick)
  }

  function start() {
    lastFrameTime = 0
    if (!animationFrame && visible && !reducedMotion.matches) animationFrame = requestAnimationFrame(tick)
  }

  function stop() {
    cancelAnimationFrame(animationFrame)
    animationFrame = 0
  }

  const resizeObserver = new ResizeObserver(resize)
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? false
    if (visible) start()
    else stop()
  })

  resize()
  draw(context, patches, time)
  resizeObserver.observe(canvas)
  intersectionObserver.observe(canvas)
  reducedMotion.addEventListener('change', start)
  start()

  return () => {
    stop()
    resizeObserver.disconnect()
    intersectionObserver.disconnect()
    reducedMotion.removeEventListener('change', start)
  }
}

export function initializeSunlights(): () => void {
  const cleanups = Array.from(
    document.querySelectorAll<HTMLCanvasElement>('[data-sunlight]'),
    initializeSunlight,
  )

  return () => {
    for (const cleanup of cleanups) cleanup()
  }
}
