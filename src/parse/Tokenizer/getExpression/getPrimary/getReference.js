define([
	'config/types',
	'parse/Tokenizer/utils/makeRegexMatcher',
	'parse/Tokenizer/getExpression/shared/getName'
], function (
	types,
	makeRegexMatcher,
	getName
) {

	'use strict';

	var getDotRefinement, getArrayRefinement, getArrayMember, globals;

	getDotRefinement = makeRegexMatcher( /^\.[a-zA-Z_$0-9]+/ );

	getArrayRefinement = function ( tokenizer ) {
		var num = getArrayMember( tokenizer );

		if ( num ) {
			return '.' + num;
		}

		return null;
	};

	getArrayMember = makeRegexMatcher( /^\[(0|[1-9][0-9]*)\]/ );

	// if a reference is a browser global, we don't deference it later, so it needs special treatment
	globals = /^(?:Array|Date|RegExp|decodeURIComponent|decodeURI|encodeURIComponent|encodeURI|isFinite|isNaN|parseFloat|parseInt|JSON|Math|NaN|undefined|null)$/;


	return function ( tokenizer ) {
		var startPos, ancestor, name, dot, combo, refinement, lastDotIndex;

		startPos = tokenizer.pos;

		// we might have ancestor refs...
		ancestor = '';
		while ( tokenizer.getStringMatch( '../' ) ) {
			ancestor += '../';
		}

		if ( !ancestor ) {
			// we might have an implicit iterator or a restricted reference
			dot = tokenizer.getStringMatch( '.' ) || '';
		}

		name = getName( tokenizer ) || '';

		// if this is a browser global, stop here
		if ( !ancestor && !dot && globals.test( name ) ) {
			return {
				t: types.GLOBAL,
				v: name
			};
		}

		// allow the use of `this`
		if ( name === 'this' && !ancestor && !dot ) {
			name = '.';
			startPos += 3; // horrible hack to allow method invocations with `this` by ensuring combo.length is right!
		}

		combo = ( ancestor || dot ) + name;

		if ( !combo ) {
			return null;
		}

		while ( refinement = getDotRefinement( tokenizer ) || getArrayRefinement( tokenizer ) ) {
			combo += refinement;
		}

		if ( tokenizer.getStringMatch( '(' ) ) {

			// if this is a method invocation (as opposed to a function) we need
			// to strip the method name from the reference combo, else the context
			// will be wrong
			lastDotIndex = combo.lastIndexOf( '.' );
			if ( lastDotIndex !== -1 ) {
				combo = combo.substr( 0, lastDotIndex );
				tokenizer.pos = startPos + combo.length;
			} else {
				tokenizer.pos -= 1;
			}
		}

		return {
			t: types.REFERENCE,
			n: combo
		};
	};



});
