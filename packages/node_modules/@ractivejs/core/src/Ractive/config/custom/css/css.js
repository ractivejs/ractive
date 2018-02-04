import { addCSS } from '../../../../global/css';
import transformCss from './transform';
import { uuid } from '../../../../utils/id';
import { warnIfDebug } from '../../../../utils/log';
import { getElement } from '../../../../utils/dom';

const hasCurly = /\{/;
export default {
	name: 'css',

	// Called when creating a new component definition
	extend: ( Parent, proto, options ) => {
		if ( !options.css ) return;
		let css = typeof options.css === 'string' && !hasCurly.test( options.css ) ?
			( getElement( options.css ) || options.css ) :
			options.css;

		const id = options.cssId || uuid();

		if ( typeof css === 'object' ) {
			css = 'textContent' in css ? css.textContent : css.innerHTML;
		}

		if ( !css ) return;

		const styles = options.noCssTransform ? css : transformCss( css, id );

		proto.cssId = id;

		addCSS( { id, styles } );
	},

	// Called when creating a new component instance
	init: ( Parent, target, options ) => {
		if ( !options.css ) return;

		warnIfDebug( `
The css option is currently not supported on a per-instance basis and will be discarded. Instead, we recommend instantiating from a component definition with a css option.

const Component = Ractive.extend({
	...
	css: '/* your css */',
	...
});

const componentInstance = new Component({ ... })
		` );
	}

};
