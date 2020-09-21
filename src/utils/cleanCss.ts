const remove = /\/\*(?:[\s\S]*?)\*\//g;
const escape = /url\(\s*(['"])(?:\\[\s\S]|(?!\1).)*\1\s*\)|url\((?:\\[\s\S]|[^)])*\)|(['"])(?:\\[\s\S]|(?!\2).)*\2/gi;
const value = /\0(\d+)/g;

/**
 * A function which can be used to put the removed strings back in place after parsing is done.
 *
 * @param css
 */
type ReconstructCSSFunction = (css: string) => string;

/**
 * Removes comments and strings from the given CSS to make it easier to parse.
 *
 * @param css
 * @param callback receives the cleaned CSS and a {@link ReconstructCSSFunction}
 * @param additionalReplaceRules
 */
export default function cleanCss(
  css: string,
  callback: (css: string, reconstruct: ReconstructCSSFunction) => unknown,
  additionalReplaceRules: RegExp[] = []
): unknown {
  const values: string[] = [];
  css = css.replace(escape, match => `\0${values.push(match) - 1}`).replace(remove, '');

  additionalReplaceRules.forEach(pattern => {
    css = css.replace(pattern, (match: string) => `\0${values.push(match) - 1}`);
  });

  const reconstruct = function (css) {
    return css.replace(value, (_match: string, n: number) => values[n]);
  } as ReconstructCSSFunction;

  return callback(css, reconstruct);
}
