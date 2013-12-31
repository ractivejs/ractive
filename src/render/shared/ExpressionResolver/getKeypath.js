define([
	'utils/normaliseKeypath',
	'render/shared/ExpressionResolver/isRegularKeypath'
], function (
	normaliseKeypath,
	isRegularKeypath
) {

	'use strict';

	return function ( str, args ) {
		var unique, normalised;

		// get string that is unique to this expression
		unique = str.replace( /\$\{([0-9]+)\}/g, function ( match, $1 ) {
			return args[ $1 ] ? args[ $1 ][1] : 'undefined';
		});

		// Special case - if we have a situation like
		// {{ items[i].value }} then we can treat it as a
		// regular keypath, rather than an expression keypath
		normalised = normaliseKeypath( unique );

		if ( isRegularKeypath( normalised ) ) {
			return normalised;
		}

		// then sanitize by removing any periods or square brackets. Otherwise
		// we can't split the keypath into keys!
		return '${' + unique.replace( /[\.\[\]]/g, '-' ) + '}';
	};

});