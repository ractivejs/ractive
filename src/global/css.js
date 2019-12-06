import { doc } from '../config/environment';

const PREFIX = '/* Ractive.js component styles */';

// Holds current definitions of styles.
const styleDefinitions = [];

// Flag to tell if we need to update the CSS
let isDirty = false;

// These only make sense on the browser. See additional setup below.
let styleElement = null;
let useCssText = null;

// flag to use multiple style tags
let _splitTag = false;
export function splitTag(v) {
  return v === undefined ? _splitTag : (_splitTag = v);
}

export function addCSS(styleDefinition) {
  styleDefinitions.push(styleDefinition);
  isDirty = true;
}

export function applyCSS(force) {
  const styleElement = style();

  // Apply only seems to make sense when we're in the DOM. Server-side renders
  // can call toCSS to get the updated CSS.
  if (!styleElement || (!force && !isDirty)) return;

  if (_splitTag) {
    styleDefinitions.forEach(s => {
      const el = getStyle(s.id);
      if (el) {
        const css = getCSS(s.id);
        if (useCssText) {
          el.styleSheet.cssText !== css && (el.styleSheet.cssText = css);
        } else {
          el.innerHTML !== css && (el.innerHTML = css);
        }
      }
    });
  } else {
    if (useCssText) {
      styleElement.styleSheet.cssText = getCSS(null);
    } else {
      styleElement.innerHTML = getCSS(null);
    }
  }

  isDirty = false;
}

export function getCSS(cssIds) {
  const filteredStyleDefinitions = cssIds
    ? styleDefinitions.filter(style => ~cssIds.indexOf(style.id))
    : styleDefinitions;

  filteredStyleDefinitions.forEach(d => (d.applied = true));

  return filteredStyleDefinitions.reduce(
    (styles, style) => `${styles ? `${styles}\n\n/* {${style.id}} */\n${style.styles}` : ''}`,
    PREFIX
  );
}

function getStyle(id) {
  return doc && (doc.querySelector(`[data-ractive-css="${id}"]`) || makeStyle(id));
}

function makeStyle(id) {
  if (doc) {
    const el = doc.createElement('style');
    el.type = 'text/css';
    el.setAttribute('data-ractive-css', id || '');

    doc.getElementsByTagName('head')[0].appendChild(el);

    if (useCssText === null) useCssText = !!el.styleSheet;

    return el;
  }
}

function style() {
  if (!styleElement) styleElement = makeStyle();

  return styleElement;
}
