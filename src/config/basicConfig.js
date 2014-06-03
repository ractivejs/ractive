import itemConfig from 'config/itemConfiguration';


function extend ( target, parentValue, value ) {

	if ( typeof value === 'undefined' ) { value = parentValue; }

	return value;
}

export default function basicConfig ( name ) {

	var config = {
		name: name,
		extend: extend,
		init: extend
	}

	return itemConfig( config );
};
