import itemConfig from 'config/itemConfiguration';
import wrapMethod from 'extend/wrapMethod';

function extend ( target, parentValue, value ) {

	if ( typeof value !== 'undefined' && value !== null ) {

		if ( typeof parentValue === 'function' ) {

			return wrapMethod( value, parentValue );
		}
		else {
			// Don't allow non-function values, but don't
			// return parent value either
			return ( typeof value === 'function' ) ? value : void 0;
		}
	}

	return parentValue;

}

export default function functionConfig ( name ) {

	var config = {
		name: name,
		extend: extend,
		init: extend
	}

	return itemConfig( config );
};
