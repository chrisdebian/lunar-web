import { withoutTrailingSlash } from 'ufo'

type PageSeo = {
  title?: string
  description?: string
  type?: 'website' | 'article'
}

/** Sets title, description, canonical URL and Open Graph tags for the current page. */
export const usePageSeo = (seo: MaybeRefOrGetter<PageSeo>) => {
  const route = useRoute()
  const { absoluteUrl } = useSiteLinks()

  const canonical = computed(() => absoluteUrl(withoutTrailingSlash(route.path) || '/'))
  const value = computed(() => toValue(seo))

  useSeoMeta({
    title: () => value.value.title,
    description: () => value.value.description,
    ogTitle: () => value.value.title ?? 'Lunar Linux',
    ogDescription: () => value.value.description,
    ogType: () => value.value.type ?? 'website',
    ogUrl: canonical,
    ogSiteName: 'Lunar Linux',
    twitterCard: 'summary'
  })

  useHead({
    link: [{ rel: 'canonical', href: canonical }]
  })
}
