import baseConfig from 'config/options/baseConfiguration';
import wrapMethod from 'utils/wrapMethod';

var config = baseConfig({
	name: 'complete',
	extendValue: wrapIfNecessary,
	initValue: wrapIfNecessary
});

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



export default config;
