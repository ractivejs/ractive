import { GLOBAL, REFERENCE } from '../../../../config/types';
import { normalise } from '../../../../shared/keypaths';

var prefixPattern = /^(?:~\/|(?:\.\.\/)+|\.\/(?:\.\.\/)*|\.)/,
	globals,
	keywords;

// if a reference is a browser global, we don't deference it later, so it needs special treatment
globals = /^(?:Array|console|Date|RegExp|decodeURIComponent|decodeURI|encodeURIComponent|encodeURI|isFinite|isNaN|parseFloat|parseInt|JSON|Math|NaN|undefined|null|Object|Number|String|Boolean)\b/;

// keywords are not valid references, with the exception of `this`
keywords = /^(?:break|case|catch|continue|debugger|default|delete|do|else|finally|for|function|if|in|instanceof|new|return|switch|throw|try|typeof|var|void|while|with)$/;

const legalReference = /^(?:[a-zA-Z$_0-9]|\\\.)+(?:(?:\.(?:[a-zA-Z$_0-9]|\\\.)+)|(?:\[[0-9]+\]))*/;
const relaxedName = /^[a-zA-Z_$][-\/a-zA-Z_$0-9]*/;
const specials = /^@(?:keypath|rootpath|index|key|this|global)/;
const specialCall = /^\s*\(/;
const spreadPattern = /^\s*\.{3}/;

export default function readReference ( parser ) {
	var startPos, prefix, name, global, reference, fullLength, lastDotIndex, spread;

	startPos = parser.pos;

	name = parser.matchPattern( specials );

	if ( name === '@keypath' || name === '@rootpath' ) {
		if ( parser.matchPattern( specialCall ) ) {
			let ref = readReference( parser );
			if ( !ref ) parser.error( `Expected a valid reference for a keypath expression` );

			parser.allowWhitespace();

			if ( !parser.matchString( ')' ) ) parser.error( `Unclosed keypath expression` );
			name += `(${ref.n})`;
		}
	}

	spread = !name && parser.spreadArgs && parser.matchPattern( spreadPattern );

	if ( !name ) {
		prefix = parser.matchPattern( prefixPattern ) || '';
		name = ( !prefix && parser.relaxedNames && parser.matchPattern( relaxedName ) ) ||
		       parser.matchPattern( legalReference );

		if ( !name && prefix === '.' ) {
			prefix = '';
			name = '.';
		} else if ( !name && prefix ) {
			name = prefix;
			prefix = '';
		}
	}

	if ( !name ) {
		return null;
	}

	// bug out if it's a keyword (exception for ancestor/restricted refs - see https://github.com/ractivejs/ractive/issues/1497)
	if ( !prefix && !parser.relaxedNames && keywords.test( name ) ) {
		parser.pos = startPos;
		return null;
	}

	// if this is a browser global, stop here
	if ( !prefix && globals.test( name ) ) {
		global = globals.exec( name )[0];
		parser.pos = startPos + global.length;

		return {
			t: GLOBAL,
			v: ( spread ? '...' : '' ) + global
		};
	}

	fullLength = ( spread ? 3 : 0 ) + ( prefix || '' ).length + name.length;
	reference = ( prefix || '' ) + normalise( name );

	if ( parser.matchString( '(' ) ) {
		// if this is a method invocation (as opposed to a function) we need
		// to strip the method name from the reference combo, else the context
		// will be wrong
		// but only if the reference was actually a member and not a refinement
		lastDotIndex = reference.lastIndexOf( '.' );
		if ( lastDotIndex !== -1 && name[ name.length - 1 ] !== ']' ) {
			let refLength = reference.length;
			reference = reference.substr( 0, lastDotIndex );
			parser.pos = startPos + (fullLength - ( refLength - lastDotIndex ) );
		} else {
			parser.pos -= 1;
		}
	}

	return {
		t: REFERENCE,
		n: ( spread ? '...' : '' ) + reference.replace( /^this\./, './' ).replace( /^this$/, '.' )
	};
}
