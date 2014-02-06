define([
	'config/types',
	'shared/registerDependant',
	'shared/unregisterDependant'
], function (
	types,
	registerDependant,
	unregisterDependant
) {

	'use strict';

	return function resolveMustache ( keypath ) {
		// In some cases, we may resolve to the same keypath (if this is
		// an expression mustache that was reassigned due to an ancestor's
		// keypath) - in which case, this is a no-op
		if ( keypath === this.keypath ) {
			return;
		}

		// if we resolved previously, we need to unregister
		if ( this.registered ) {
			unregisterDependant( this );
		}

		this.keypath = keypath;
		registerDependant( this );

		this.update();

		// Special case - two-way binding to an expression that we were
		// eventually able to substitute a regular keypath for
		if ( this.root.twoway && this.parentFragment.owner.type === types.ATTRIBUTE ) {
			this.parentFragment.owner.element.bind();
		}

		// TODO is there any need for this?
		if ( this.expressionResolver && this.expressionResolver.resolved ) {
			this.expressionResolver = null;
		}
	};

});
