import { isFunction } from 'utils/is';
import { addCSS, applyCSS } from 'src/global/css';
import { recomputeCSS } from './styleSet';

export default function addStyle(id, css) {
  if (this.extraStyles.find(s => s.id === id))
    throw new Error(`Extra styles with the id '${id}' have already been added.`);
  this.extraStyles.push({ id, css });

  if (!this._css) {
    Object.defineProperty(this, '_css', { configurable: false, writable: false, value: _css });
  }

  if (!this._cssDef) {
    Object.defineProperty(this, '_cssDef', {
      configurable: false,
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

function _css(data) {
  return this.extraStyles
    .map(s => `\n/* ---- extra style ${s.id} */\n` + (isFunction(s.css) ? s.css(data) : s.css))
    .join('');
}
