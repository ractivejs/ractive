define([
	'shared/registerDependant',
	'shared/unregisterDependant'
], function (
	registerDependant,
	unregisterDependant
) {
	
	'use strict';

	return function ( keypath ) {
		// if we resolved previously, we need to unregister
		if ( this.resolved ) {
			unregisterDependant( this );
		}

		this.keypath = keypath;
		registerDependant( this );
		
		this.update();

		// TODO is there any need for this?
		if ( this.expressionResolver && this.expressionResolver.resolved ) {
			this.expressionResolver = null;
		}

		this.resolved = true;
	};

}); 