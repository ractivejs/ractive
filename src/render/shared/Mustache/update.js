define([
	'utils/isEqual',
	'shared/get/_get'
], function (
	isEqual,
	get
) {

	'use strict';

	var options = { evaluateWrapped: true };

	return function updateMustache () {
		var value = get( this.root, this.keypath, options );

		if ( !isEqual( value, this.value ) ) {
			this.render( value );
			this.value = value;
		}
	};

});
