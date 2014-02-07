define([
	'utils/normaliseKeypath',
	'shared/get/_get'
], function (
	normaliseKeypath,
	get
) {

	'use strict';

	return function Ractive_prototype_get ( keypath ) {
		keypath = normaliseKeypath( keypath );
		return get( this, keypath );
	};

});
