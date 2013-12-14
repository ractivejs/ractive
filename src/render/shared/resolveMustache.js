define([
	'shared/registerDependant',
	'shared/unregisterDependant'
], function (
	registerDependant,
	unregisterDependant
) {
	
	'use strict';

	return function ( keypath ) {
		// In some cases, we may resolve to the same keypath (if this is
		// an expression mustache that was reassigned due to an ancestor's
		// keypath) - in which case, this is a no-op
		if ( keypath === this.keypath ) {
			return;
		}

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