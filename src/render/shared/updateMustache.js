define([
	'utils/isEqual',
	'shared/get/_get'
], function (
	isEqual,
	get
) {

	'use strict';

	return function updateMustache () {
		var value = get( this.root, this.keypath, true );

		if ( !isEqual( value, this.value ) ) {
			this.render( value );
			this.value = value;
		}
	};

});
