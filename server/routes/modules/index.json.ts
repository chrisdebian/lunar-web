/**
 * The moonbase module index (see server/utils/moonbaseIndex.ts), published as /modules/index.json:
 * the data behind the /modules pages, and the published copy that builds without their own index
 * (development, PR previews) download.
 */
export default defineEventHandler(() => loadMoonbaseIndex())
