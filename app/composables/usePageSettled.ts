const MAX_WAIT_MS = 2500

/**
 * Becomes true once the page has settled: loaded, fonts swapped in and two frames painted, or after
 * at most 2.5 s. Hold intro animations paused until then: on a cold load the browser is busy
 * starting the app and the animation would stutter, especially on iPhone (see AGENTS.md).
 * After client-side navigation it turns true within two frames.
 */
export const usePageSettled = () => {
  const isSettled = ref(false)

  onMounted(async () => {
    const pageLoaded = document.readyState === 'complete'
      ? Promise.resolve()
      : new Promise(resolve => window.addEventListener('load', resolve, { once: true }))
    const timeout = new Promise(resolve => setTimeout(resolve, MAX_WAIT_MS))
    await Promise.race([Promise.all([pageLoaded, document.fonts.ready]), timeout])
    // Two frames, so the (nearly invisible) first frame is painted before anything moves.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      isSettled.value = true
    }))
  })

  return isSettled
}
