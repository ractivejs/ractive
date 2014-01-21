define([
	'utils/normaliseKeypath',
	'render/shared/ExpressionResolver/isRegularKeypath'
], function (
	normaliseKeypath,
	isRegularKeypath
) {

	'use strict';

	return function ( uniqueString ) {
		var normalised;

		// Special case - if we have a situation like
		// {{ items[i].value }} then we can treat it as a
		// regular keypath, rather than an expression keypath
		normalised = normaliseKeypath( uniqueString );

		if ( isRegularKeypath( normalised ) ) {
			return normalised;
		}

		// then sanitize by removing any periods or square brackets. Otherwise
		// we can't split the keypath into keys!
		return '${' + normalised.replace( /[\.\[\]]/g, '-' ) + '}';
	};

});