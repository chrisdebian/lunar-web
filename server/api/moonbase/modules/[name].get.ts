/** One module with the modules around it, for /modules/<name>. */
export default defineEventHandler(async (event) => {
  const page = moonbaseModulePage(await loadMoonbaseIndex(), decodeURIComponent(getRouterParam(event, 'name') ?? ''))
  if (!page) throw createError({ statusCode: 404, statusMessage: 'No such module in the moonbase' })
  return page
})
