define([
	'utils/normaliseKeypath',
	'shared/registerDependant',
	'shared/unregisterDependant',
	'Ractive/prototype/observe/Observer',
	'Ractive/prototype/observe/PatternObserver'
], function (
	normaliseKeypath,
	registerDependant,
	unregisterDependant,
	Observer,
	PatternObserver
) {

	'use strict';

	var wildcard = /\*/, emptyObject = {};

	return function getObserverFacade ( ractive, keypath, callback, options ) {
		var observer, isPatternObserver;

		keypath = normaliseKeypath( keypath );
		options = options || emptyObject;

		// pattern observers are treated differently
		if ( wildcard.test( keypath ) ) {
			observer = new PatternObserver( ractive, keypath, callback, options );
			ractive._patternObservers.push( observer );
			isPatternObserver = true;
		} else {
			observer = new Observer( ractive, keypath, callback, options );
		}

		registerDependant( observer );
		observer.init( options.init );

		// This flag allows observers to initialise even with undefined values
		observer.ready = true;

		return {
			cancel: function () {
				var index;

				if ( isPatternObserver ) {
					index = ractive._patternObservers.indexOf( observer );

					if ( index !== -1 ) {
						ractive._patternObservers.splice( index, 1 );
					}
				}

				unregisterDependant( observer );
			}
		};
	};

});
