import baseConfig from 'config/options/baseConfiguration';

function extend ( target, parentValue, value ) {

	//if ( typeof value === 'undefined' ) { value = parentValue; }

	return value;
}

export default function optionConfig ( name ) {

	return baseConfig({
		name: name,
		initValue: extend
	});
}
