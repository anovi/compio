# Noise gradient

`NoiseGradient.astro` adds a scroll-responsive canvas gradient and a repeating grain layer to a containing element. The component supports multiple instances on the same page and pauses rendering while an instance is outside the viewport.

## Usage

Import the component and place it before the foreground content:

```astro
---
import { NoiseGradient } from '../components/noise-gradient'
---

<section class="gradient-surface">
  <NoiseGradient />

  <div class="gradient-surface__content">
    <h2>Content over the gradient</h2>
  </div>
</section>

<style>
  @layer components {
    .gradient-surface {
      isolation: isolate;
      position: relative;
      overflow: hidden;
      border-radius: 28px;
    }

    .gradient-surface__content {
      position: relative;
      z-index: 3;
    }
  }
</style>
```

The containing element must establish a positioned, isolated stacking context. Add `overflow: hidden` when the canvas and grain should follow the container's border radius. Foreground content can use `z-index: 1` to sit below the grain or `z-index: 3` to sit above it.

The component imports `noise-gradient.css` and initializes every `[data-noise-gradient]` canvas through `noise-gradient.ts`; consumers do not need to import those files separately.
