import styleSet from '../Ractive/static/styleSet';
import CSSModel from 'src/model/specials/CSSModel';
import { assign, create, defineProperties, defineProperty } from 'utils/object';

import { initCSS } from 'src/Ractive/config/custom/css/css';

export default function macro ( fn, opts ) {
	if ( typeof fn !== 'function' ) throw new Error( `The macro must be a function` );

	assign( fn, opts );

	defineProperties( fn, {
		extensions: { value: [] },
		_cssIds: { value: [] },
		cssData: { value: assign( create( this.cssData ), fn.cssData || {} ) },

		styleSet: { value: styleSet.bind( fn ) }
	});

	defineProperty( fn, '_cssModel', { value: new CSSModel( fn ) } );

	if ( fn.css ) initCSS( fn, fn, fn );

	return fn;
}
