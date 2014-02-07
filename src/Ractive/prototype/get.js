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

		// capture the dependency, if we're inside an evaluator
		if ( this._captured && !this._captured[ keypath ] ) {
			this._captured.push( keypath );
			this._captured[ keypath ] = true;
		}

		return get( this, keypath );
	};

});
