# Notes for agents and contributors

Project overview, commands and conventions: see [README.md](README.md) and [CONTRIBUTING.md](CONTRIBUTING.md).
Run `yarn verify` before committing.

## Animations must stay smooth on iPhone (Safari / WebKit)

Every iOS browser uses WebKit. An animation that is perfectly smooth in desktop Chrome can run at a
few frames per second on an iPhone. We hit this with the hero moon's "first light" intro; these are
the rules that fixed it.

**What went wrong.** The intro moved a shadow circle *inside an SVG `<mask>`*, in an SVG that also used
`feGaussianBlur` and `feTurbulence` filters. WebKit cannot hand that to the GPU, so it re-rasterized the
whole filtered, masked SVG on the CPU every frame, at ~3× device pixel ratio: about three frames for the
whole animation.

**Rules**

1. **Animate only `transform` and `opacity`**, on elements that contain nothing expensive to repaint.
   These run on the compositor (GPU).
2. **Never animate anything inside an SVG `<mask>` or `<clipPath>`, or anything with SVG filters**
   (`feGaussianBlur`, `feTurbulence`, …), or the attributes of elements in such an SVG.
3. **Build animated visuals in layers:** draw the expensive parts once as a static SVG, and move a separate
   HTML element on top with `transform`. Example: `app/components/ui/LunarMoon.vue` (static lit surface,
   an HTML shadow disc with a gradient edge that slides, a static halo). A soft edge can be a
   `radial-gradient` instead of a blur filter.
4. **Ambient motion inside a masked or filtered parent** (e.g. `.hero-sky`, which has `mask-image`) must be
   its own small element with `will-change`, not part of the masked SVG. Example: the `.twinkle` stars in
   `app/components/sections/HeroSection.vue`.
5. **Don't fade a whole layered composition with `opacity`** when one layer is meant to be opaque (the moon
   hides the stars behind it). Group opacity makes it see-through. Dim the specific layers instead (the moon
   uses a `--moon-light` custom property for the lit surface and halo).
6. **Cold first loads are the worst case.** The browser is fetching and starting the app, swapping in fonts
   and painting filters (`feTurbulence`) for the first time. Hold intro animations paused until the page has
   settled: `load` + `document.fonts.ready` + two `requestAnimationFrame`s, capped at ~2.5 s
   (`isMoonReady` in `HeroSection.vue`). Start from `opacity: 0.001`, not `0`, so the layer is painted
   before it becomes visible. If JavaScript starts an animation, add a `<noscript>` fallback that shows the
   end state.
7. **Respect `prefers-reduced-motion`**: show the final state with no motion.

**Testing.** Playwright/Chromium cannot reproduce WebKit's frame rate; a smooth run there proves nothing
for iPhone. Test on a real iPhone, and test a cold load in a new private tab (empty cache) as well as a
reload.

### Revealing a drawing (a path that "draws itself")

Don't animate `stroke-dashoffset` or a mask. Wipe it in with two opposite transforms instead: a
clipping box (`overflow: hidden`) slides from `translateY(-100%)` to `0` while the drawing inside slides
from `translateY(100%)` to `0`. The drawing stays put and is uncovered from the top, using transforms
only. The box itself must clip, or the two transforms cancel out and nothing is hidden. Example: the
trajectory in `app/pages/docs/index.vue`. For a straight dotted line, sliding the dots in is enough
(the orbit in `app/pages/news/index.vue`).

### Related gotcha: `pathLength` with `vector-effect="non-scaling-stroke"`

Don't combine them on a line whose `stroke-dashoffset` you animate. Browsers then compute the dash in
screen pixels while `pathLength` assumes user units, so the dash repeats along the line instead of
drawing it once. The constellation in `CommunitySection.vue` reveals its dotted lines with a separate
mask "pen" line that has `pathLength` but no `non-scaling-stroke`.
