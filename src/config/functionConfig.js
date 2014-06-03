import baseConfig from 'config/baseConfig';
import wrapMethod from 'extend/wrapMethod';

function wrapIfNecessary ( target, parentValue, value ) {

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
		extendValue: wrapIfNecessary,
		initValue: wrapIfNecessary
	}

	return baseConfig( config );
};
