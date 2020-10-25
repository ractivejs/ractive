import cleanCss from 'utils/cleanCss';
import { trim } from 'utils/string';

const selectorsPattern = /(?:^|\}|\{|\x01)\s*([^\{\}\0\x01]+)\s*(?=\{)/g;
const importPattern = /@import\s*\([^)]*\)\s*;?/gi;
const importEndPattern = /\x01/g;
const keyframesDeclarationPattern = /@keyframes\s+[^\{\}]+\s*\{(?:[^{}]+|\{[^{}]+})*}/gi;
const selectorUnitPattern = /((?:(?:\[[^\]]+\])|(?:[^\s\+\>~:]))+)((?:::?[^\s\+\>\~\(:]+(?:\([^\)]+\))?)*\s*[\s\+\>\~]?)\s*/g;
const excludePattern = /^(?:@|\d+%)/;
const dataRvcGuidPattern = /\[data-ractive-css~="\{[a-z0-9-]+\}"]/g;

interface SelectorUnit {
  str: string;
  base: string;
  modifiers: string;
}

function extractString(unit: SelectorUnit): SelectorUnit['str'] {
  return unit.str;
}

function transformSelector(selector: string, parent: string): string {
  const selectorUnits: SelectorUnit[] = [];
  let match: RegExpExecArray;

  while ((match = selectorUnitPattern.exec(selector))) {
    selectorUnits.push({
      str: match[0],
      base: match[1],
      modifiers: match[2]
    });
  }

  // For each simple selector within the selector, we need to create a version
  // that a) combines with the id, and b) is inside the id
  const base = selectorUnits.map(extractString);

  const transformed: string[] = [];
  let i = selectorUnits.length;

  while (i--) {
    const appended = base.slice();

    // Pseudo-selectors should go after the attribute selector
    const unit = selectorUnits[i];
    appended[i] = unit.base + parent + unit.modifiers || '';

    const prepended = base.slice();
    prepended[i] = parent + ' ' + prepended[i];

    transformed.push(appended.join(' '), prepended.join(' '));
  }

  return transformed.join(', ');
}

export default function transformCss(css: string, id: string): string {
  const dataAttr = `[data-ractive-css~="{${id}}"]`;

  let transformed: string;

  if (dataRvcGuidPattern.test(css)) {
    transformed = css.replace(dataRvcGuidPattern, dataAttr);
  } else {
    transformed = cleanCss(
      css,
      (css, reconstruct) => {
        css = css
          .replace(importPattern, '$&\x01')
          .replace(selectorsPattern, (match, $1: string) => {
            // don't transform at-rules and keyframe declarations
            if (excludePattern.test($1)) return match;

            const selectors = $1.split(',').map(trim);
            const transformed =
              selectors.map(selector => transformSelector(selector, dataAttr)).join(', ') + ' ';

            return match.replace($1, transformed);
          })
          .replace(importEndPattern, '');

        return reconstruct(css);
      },
      [keyframesDeclarationPattern]
    );
  }

  return transformed;
}
