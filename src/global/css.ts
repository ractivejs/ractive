import { doc } from 'config/environment';
import { isArray } from 'utils/is';

const PREFIX = '/* Ractive.js component styles */';

// Holds current definitions of styles.
const styleDefinitions = [];

// Flag to tell if we need to update the CSS
let isDirty = false;

// These only make sense on the browser. See additional setup below.
let styleElement = null;

// flag to use multiple style tags
let _splitTag = false;
export function splitTag(v: boolean): boolean {
  return v === undefined ? _splitTag : (_splitTag = v);
}

function makeStyle(id?: string): HTMLStyleElement {
  if (doc) {
    const el = doc.createElement('style');
    el.type = 'text/css';
    el.setAttribute('data-ractive-css', id || '');

    doc.getElementsByTagName('head')[0].appendChild(el);
    return el;
  }
}

function style(): HTMLStyleElement {
  if (!styleElement) styleElement = makeStyle();

  return styleElement;
}

function getStyle(id: string): HTMLStyleElement {
  return doc && (doc.querySelector(`[data-ractive-css="${id}"]`) || makeStyle(id));
}

export function getCSS(cssIds: string[]): string {
  if (cssIds && !isArray(cssIds)) cssIds = [cssIds];
  const filteredStyleDefinitions = cssIds
    ? styleDefinitions.filter(style => ~cssIds.indexOf(style.id))
    : styleDefinitions;

  filteredStyleDefinitions.forEach(d => (d.applied = true));

  return filteredStyleDefinitions.reduce(
    (styles, style) => `${styles ? `${styles}\n\n/* {${style.id}} */\n${style.styles}` : ''}`,
    PREFIX
  );
}

export function addCSS(styleDefinition: string): void {
  styleDefinitions.push(styleDefinition);
  isDirty = true;
}

export function applyCSS(force: boolean): void {
  const styleElement = style();

  // Apply only seems to make sense when we're in the DOM. Server-side renders
  // can call toCSS to get the updated CSS.
  if (!styleElement || (!force && !isDirty)) return;
  if (_splitTag) {
    styleDefinitions.forEach(s => {
      const el = getStyle(s.id);
      if (el) {
        const css = getCSS(s.id);
        if (el.innerHTML !== css) {
          el.innerHTML = css;
        }
      }
    });
  } else {
    styleElement.innerHTML = getCSS(null);
  }

  isDirty = false;
}
