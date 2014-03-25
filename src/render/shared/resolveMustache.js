define([
	'config/types',
	'shared/registerDependant',
	'shared/unregisterDependant',
	'shared/reassignFragment/_reassignFragment'
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
	};

});
