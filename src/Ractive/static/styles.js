import { isFunction } from 'utils/is';
import { addCSS, applyCSS } from 'src/global/css';
import { recomputeCSS } from './styleSet';

const styles = [];

export function addStyle(id, css) {
  if (styles.find(s => s.id === id))
    throw new Error(`Extra styles with the id '${id}' have already been added.`);
  styles.push({ id, css });

  if (!this.css) {
    Object.defineProperty(this, 'css', { configurable: false, writable: false, value: buildCSS });
  }

  if (!this._cssDef) {
    Object.defineProperty(this, '_cssDef', {
      configurable: true,
      writable: false,
      value: {
        transform: false,
        id: 'Ractive.addStyle'
      }
    });

    addCSS(this._cssDef);
  }

  recomputeCSS(this);
  applyCSS(true);
}

function buildCSS(data) {
  return styles
    .map(s => `\n/* ---- extra style ${s.id} */\n` + (isFunction(s.css) ? s.css(data) : s.css))
    .join('');
}

export function hasStyle(id) {
  return !!styles.find(s => s.id === id);
}
