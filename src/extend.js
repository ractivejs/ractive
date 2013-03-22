(function ( A ) {

	'use strict';

	A.extend = function ( childProps ) {

		var Parent, Child, key;

		Parent = this;

		Child = function () {
			A.apply( this, arguments );

			if ( this.init ) {
				this.init.apply( this, arguments );
			}
		};

		// extend child with parent methods
		for ( key in Parent.prototype ) {
			if ( Parent.prototype.hasOwnProperty( key ) ) {
				Child.prototype[ key ] = Parent.prototype[ key ];
			}
		}

		// extend child with specified methods, as long as they don't override Anglebars.prototype methods
		for ( key in childProps ) {
			if ( childProps.hasOwnProperty( key ) ) {
				if ( A.prototype.hasOwnProperty( key ) ) {
					throw new Error( 'Cannot override "' + key + '" method or property of Anglebars prototype' );
				}

				Child.prototype[ key ] = childProps[ key ];
			}
		}

		Child.extend = Parent.extend;

		return Child;
	};

}( Anglebars ));