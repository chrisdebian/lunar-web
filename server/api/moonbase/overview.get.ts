/** The sections of the moonbase and how many modules each has, for /modules. */
export default defineEventHandler(async () => moonbaseOverview(await loadMoonbaseIndex()))
