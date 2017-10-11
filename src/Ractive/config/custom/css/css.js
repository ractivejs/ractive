import { addCSS } from 'src/global/css';
import transformCss from './transform';
import { uuid } from 'utils/id';
import { warnIfDebug } from 'utils/log';
import { getElement } from 'utils/dom';
import { splitKeypath } from 'shared/keypaths';
import CSSModel from 'src/model/specials/CSSModel';
import { assign, create, defineProperty } from 'utils/object';

const hasCurly = /\{/;
export default {
	name: 'css',

	// Called when creating a new component definition
	extend: ( Parent, proto, options, Child ) => {
		Child._cssIds = gatherIds( Parent );

		defineProperty( Child, 'cssData', {
			configurable: true,
			value: assign( create( Parent.cssData ), options.cssData || {} )
		});

		defineProperty( Child, '_cssModel', {
			configurable: true,
			value: new CSSModel( Child )
		});

		if ( !options.css ) return;

		let css = typeof options.css === 'string' && !hasCurly.test( options.css ) ?
			( getElement( options.css ) || options.css ) :
			options.css;

		const id = options.cssId || uuid();

		if ( typeof css === 'object' ) {
			css = 'textContent' in css ? css.textContent : css.innerHTML;
		} else if ( typeof css === 'function' ) {
			Child._css = options.css;
			css = evalCSS( Child, css );
		}

		const def = Child._cssDef = { transform: !options.noCssTransform };

		def.styles = def.transform ? transformCss( css, id ) : css;
		def.id = proto.cssId = id;
		Child._cssIds.push( id );

		addCSS( Child._cssDef );
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

function gatherIds ( start ) {
	let cmp = start;
	const ids = [];

	while ( cmp ) {
		if ( cmp.prototype.cssId ) ids.push( cmp.prototype.cssId );
		cmp = cmp.Parent;
	}

	return ids;
}

export function evalCSS ( component, css ) {
	const cssData = component.cssData;
	const model = component._cssModel;
	const data = function data ( path ) {
		return model.joinAll( splitKeypath( path ) ).get();
	};
	data.__proto__ = cssData;

	const result = css.call( component, data );
	return typeof result === 'string' ? result : '';
}
