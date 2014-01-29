define( function () {

	'use strict';

	return function ( item ) {
		var index = this.indexOf( this._isComponentQuery ? item.instance : item.node );

		if ( index !== -1 ) {
			this.splice( index, 1 );
		}
	};

});
