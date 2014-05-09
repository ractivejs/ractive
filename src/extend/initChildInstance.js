import initOptions from 'config/initOptions';
import wrapMethod from 'extend/wrapMethod';
import initialise from 'Ractive/initialise';

// The Child constructor contains the default init options for this class

export default function initChildInstance ( child, Child, options ) {

	initOptions.keys.forEach( function ( key ) {
		var value = options[ key ], defaultValue = Child.defaults[ key ];

		if ( typeof value === 'function' && typeof defaultValue === 'function' ) {
			options[ key ] = wrapMethod( value, defaultValue );
		}
	});

	if ( child.beforeInit ) {
		child.beforeInit( options );
	}

	initialise( child, options );
}
