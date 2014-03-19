define([
	'config/types',
	'shared/registerDependant',
	'shared/unregisterDependant',
	'render/DomFragment/Section/reassignFragment' // TODO move this!
], function (
	types,
	registerDependant,
	unregisterDependant,
	reassignFragment
) {

	'use strict';

	return function resolveMustache ( keypath ) {
		var i;

		// In some cases, we may resolve to the same keypath (if this is
		// an expression mustache that was reassigned due to an ancestor's
		// keypath) - in which case, this is a no-op
		if ( keypath === this.keypath ) {
			return;
		}

		// if we resolved previously, we need to unregister
		if ( this.registered ) {
			unregisterDependant( this );

			// is this a section? if so, we may have children that need
			// to be reassigned
			// TODO only DOM sections?
			if ( this.type === types.SECTION ) {
				i = this.fragments.length;
				while ( i-- ) {
					reassignFragment( this.fragments[i], null, null, this.keypath, keypath );
				}
			}
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
