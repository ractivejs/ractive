import itemConfig from 'config/itemConfiguration';

function extend ( target, parentValue, value ) {

	if ( typeof value === 'undefined' ) { value = parentValue; }

	return value;

}

export default function basicConfig ( config ) {
	config.extend = extend;
	config.init = extend;
	return itemConfig( config );
};
