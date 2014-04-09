define([
	'config/initOptions',
	'extend/wrapMethod',
	'Ractive/initialise'
], function (
	initOptions,
	wrapMethod,
	initialise
) {

	'use strict';

	// The Child constructor contains the default init options for this class

	return function initChildInstance ( child, Child, options ) {

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

		// If this is an inline component (i.e. NOT created with `var widget = new Widget()`,
		// but rather `<widget/>` or similar), we don't want to call the `init` method until
		// the component is in the DOM. That makes it easier for component authors to do stuff
		// like `this.width = this.find('*').clientWidth` or whatever without using
		// ugly setTimeout hacks.
		if ( options._parent && options._parent._rendering ) {
			options._parent._childInitQueue.push({ instance: child, options: options });
		} else if ( child.init ) {
			child.init( options );
		}
	};

});
