import cleanCss from 'utils/cleanCss';
import { isString } from 'utils/is';

const space = /\s+/;

export type CSSPropertiesValueMap = {
  [key: string]: string;
};

export function readStyle(css: string): CSSPropertiesValueMap {
  if (!isString(css)) return {};

  return cleanCss(css, (css, reconstruct) => {
    return css
      .split(';')
      .filter(rule => !!rule.trim())
      .map(reconstruct)
      .reduce((rules, rule) => {
        const separatorIndex = rule.indexOf(':');
        const name = rule.substr(0, separatorIndex).trim();
        rules[name] = rule.substr(separatorIndex + 1).trim();
        return rules;
      }, {});
  }) as CSSPropertiesValueMap;
}

export function readClass(str: string): string[] {
  const list = str.split(space);

  // remove any empty entries
  let i = list.length;
  while (i--) {
    if (!list[i]) list.splice(i, 1);
  }

  return list;
}
