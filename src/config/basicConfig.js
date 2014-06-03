import baseConfig from 'config/baseConfig';


function extend ( target, parentValue, value ) {

	if ( typeof value === 'undefined' ) { value = parentValue; }

	return value;
}

export default function basicConfig ( name ) {

	var config = {
		name: name,
		extendValue: extend,
		initValue: extend
	}

	return baseConfig( config );
};
