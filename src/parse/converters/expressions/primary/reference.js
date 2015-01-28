import { GLOBAL, REFERENCE } from 'config/types';
import { name as namePattern, relaxedName } from '../shared/patterns';

var dotRefinementPattern, arrayMemberPattern, getArrayRefinement, globals, keywords;
dotRefinementPattern = /^\.[a-zA-Z_$0-9]+/;

getArrayRefinement = function ( parser ) {
	var num = parser.matchPattern( arrayMemberPattern );

	if ( num ) {
		return '.' + num;
	}

	return null;
};

arrayMemberPattern = /^\[(0|[1-9][0-9]*)\]/;

// if a reference is a browser global, we don't deference it later, so it needs special treatment
globals = /^(?:Array|console|Date|RegExp|decodeURIComponent|decodeURI|encodeURIComponent|encodeURI|isFinite|isNaN|parseFloat|parseInt|JSON|Math|NaN|undefined|null)$/;

// keywords are not valid references, with the exception of `this`
keywords = /^(?:break|case|catch|continue|debugger|default|delete|do|else|finally|for|function|if|in|instanceof|new|return|switch|throw|try|typeof|var|void|while|with)$/;

export default function ( parser ) {
	var startPos, ancestor, name, dot, combo, refinement, lastDotIndex, pattern;

	startPos = parser.pos;

	// we might have a root-level reference
	if ( parser.matchString( '~/' ) ) {
		ancestor = '~/';
	}

	else {
		// we might have ancestor refs...
		ancestor = '';
		while ( parser.matchString( '../' ) ) {
			ancestor += '../';
		}
	}

	if ( !ancestor ) {
		// we might have an implicit iterator or a restricted reference
		dot = parser.matchString( './' ) || parser.matchString( '.' ) || '';
	}

	pattern = parser.relaxedNames ? relaxedName : namePattern;
	name = parser.matchPattern( /^@(?:keypath|index|key)/ ) || parser.matchPattern( pattern ) || '';

	// bug out if it's a keyword (exception for ancestor/restricted refs - see https://github.com/ractivejs/ractive/issues/1497)
	if ( !parser.relaxedNames && !dot && !ancestor && keywords.test( name ) ) {
		parser.pos = startPos;
		return null;
	}

	// if this is a browser global, stop here
	if ( !ancestor && !dot && !parser.relaxedNames && globals.test( name ) ) {
		return {
			t: GLOBAL,
			v: name
		};
	}

	combo = ( ancestor || dot ) + name;

	if ( !combo ) {
		return null;
	}

	while ( refinement = parser.matchPattern( dotRefinementPattern ) || getArrayRefinement( parser ) ) {
		combo += refinement;
	}

	if ( parser.matchString( '(' ) ) {

		// if this is a method invocation (as opposed to a function) we need
		// to strip the method name from the reference combo, else the context
		// will be wrong
		lastDotIndex = combo.lastIndexOf( '.' );
		if ( lastDotIndex !== -1 ) {
			combo = combo.substr( 0, lastDotIndex );
			parser.pos = startPos + combo.length;
		} else {
			parser.pos -= 1;
		}
	}

	return {
		t: REFERENCE,
		n: combo.replace( /^this\./, './' ).replace( /^this$/, '.' )
	};
}
