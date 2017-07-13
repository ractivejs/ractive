import { applyCSS } from '../../global/css';
import transformCSS from '../config/custom/css/transform';
import { evalCSS } from '../config/custom/css/css';
import { splitKeypath } from '../../shared/keypaths';
import { isObjectLike, isNumeric } from '../../utils/is';

export default function setCSSData ( obj, val, options ) {
	let opts;
	if ( typeof obj === 'string' ) {
		const key = obj;
		obj = {};
		obj[key] = val;
		opts = options || {};
	} else {
		opts = val || {};
	}

	Object.keys( obj ).forEach( k => {
		const path = splitKeypath( k );
		const key = path.pop();
		let dest = this.cssData;

		for ( let i = 0; i < path.length; i++ ) {
			const k = path[i];
			if ( !isObjectLike( dest[k] ) ) dest[k] = isNumeric( k ) ? [] : {};
			dest = dest[ path[i] ];
		}
		if ( isObjectLike( dest ) ) dest[ key ] = obj[k];
	});

	recomputeCSS( this );

	// if this change should cascade to further extensions, let them know
	if ( opts.cascade !== false ) {
		this.extensions.forEach( e => e.styleSet( {}, { apply: false } ) );
	}

	// if this css is already applied and the user hasn't requested that it
	// not be updated, go ahead and trigger a reapply
	const def = this._cssDef;
	if ( ( ( !def && this.extensions.length ) || ( def && def.applied ) ) && opts.apply !== false ) {
		applyCSS( true );
	}
}

function recomputeCSS ( component ) {
	const css = component._css;

	if ( typeof css !== 'function' ) return;

	const def = component._cssDef;
	const result = evalCSS( component, css );
	const styles = def.transform ? transformCSS( result, def.id ) : result;

	if ( def.styles === styles ) return;

	def.styles = styles;

	return true;
}
