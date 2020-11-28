import type { Ractive } from 'src/Ractive/RactiveDefinition';
import { isFunction } from 'utils/is';

/* eslint no-console:"off" */
const win: Window & { Ractive?: typeof Ractive } = typeof window !== 'undefined' ? window : null;
const doc = win ? document : null;
const isClient = !!doc;
const base = typeof global !== 'undefined' ? global : win;
const hasConsole =
  typeof console !== 'undefined' && isFunction(console.warn) && isFunction(console.warn.apply);

const svg = doc
  ? doc.implementation.hasFeature('http://www.w3.org/TR/SVG11/feature#BasicStructure', '1.1')
  : false;

const vendors = ['o', 'ms', 'moz', 'webkit'];

export { win, doc, isClient, hasConsole, svg, vendors, base };
