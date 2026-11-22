/** One section's modules, for /modules/section/<section>. */
export default defineEventHandler(async (event) => {
  const section = moonbaseSection(await loadMoonbaseIndex(), getRouterParam(event, 'section') ?? '')
  if (!section) throw createError({ statusCode: 404, statusMessage: 'No such section in the moonbase' })
  return section
})
