/**
 * Shared open/closed state of the docs search dialog, so any component can open it
 * (header buttons, the homepage docs section, …). The dialog itself is rendered once,
 * by the full (non-compact) <DocsSearch> in the header.
 */
export const useSearchDialog = () => {
  const isOpen = useState('docs-search-open', () => false)
  return {
    isOpen,
    open: () => {
      isOpen.value = true
    },
    close: () => {
      isOpen.value = false
    }
  }
}
