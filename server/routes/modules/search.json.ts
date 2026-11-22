/**
 * Every module's name, version, section and short description, for the search box on /modules
 * (about 100 KB compressed, loaded once). The full data is in /modules/index.json.
 */
export default defineEventHandler(async () => moonbaseSearchList(await loadMoonbaseIndex()))
