define([
	'config/types',
	'parse/getToken/utils/getStringMatch',
	'parse/getToken/utils/getRegexMatcher',
	'parse/getToken/getMustacheOrTriple/getExpression/shared/getName'
], function (
	types,
	getStringMatch,
	getRegexMatcher,
	getName
) {
	
	'use strict';

	var getDotRefinement, getArrayRefinement, getArrayMember, globals;
	
	getDotRefinement = getRegexMatcher( /^\.[a-zA-Z_$0-9]+/ );

	getArrayRefinement = function ( tokenizer ) {
		var num = getArrayMember( tokenizer );

		if ( num ) {
			return '.' + num;
		}

		return null;
	};

	getArrayMember = getRegexMatcher( /^\[(0|[1-9][0-9]*)\]/ );

	// if a reference is a browser global, we don't deference it later, so it needs special treatment
	globals = /^(?:Array|Date|RegExp|decodeURIComponent|decodeURI|encodeURIComponent|encodeURI|isFinite|isNaN|parseFloat|parseInt|JSON|Math|NaN|undefined|null)$/;


	return function ( tokenizer ) {
		var startPos, ancestor, name, dot, combo, refinement, lastDotIndex;

		startPos = tokenizer.pos;

		// we might have ancestor refs...
		ancestor = '';
		while ( getStringMatch( tokenizer, '../' ) ) {
			ancestor += '../';
		}

		if ( !ancestor ) {
			// we might have an implicit iterator or a restricted reference
			dot = getStringMatch( tokenizer, '.' ) || '';
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

		if ( getStringMatch( tokenizer, '(' ) ) {
			
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