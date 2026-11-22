/**
 * A module page's path. Names that end like a file extension (`webkit2gtk-4.1`, `CGI.pm`,
 * `fltk1.3`) get a trailing slash: without it, the prerenderer takes the link for a file and
 * never builds the page, and static hosts would serve it as a download.
 */
export const modulePath = (name: string) => (/\.[^./]+$/.test(name) ? `/modules/${name}/` : `/modules/${name}`)
