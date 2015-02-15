import { GLOBAL, REFERENCE } from 'config/types';
import { normalise } from 'shared/keypaths';

var prefixPattern = /^(?:~\/|(?:\.\.\/)+|\.\/(?:\.\.\/)*|\.)/,
	globals,
	keywords;

// if a reference is a browser global, we don't deference it later, so it needs special treatment
globals = /^(?:Array|console|Date|RegExp|decodeURIComponent|decodeURI|encodeURIComponent|encodeURI|isFinite|isNaN|parseFloat|parseInt|JSON|Math|NaN|undefined|null)\b/;

// keywords are not valid references, with the exception of `this`
keywords = /^(?:break|case|catch|continue|debugger|default|delete|do|else|finally|for|function|if|in|instanceof|new|return|switch|throw|try|typeof|var|void|while|with)$/;

var legalReference = /^[a-zA-Z$_0-9]+(?:(?:\.[a-zA-Z$_0-9]+)|(?:\[[0-9]+\]))*/;
var relaxedName = /^[a-zA-Z_$][-a-zA-Z_$0-9]*/;

export default function readReference ( parser ) {
	var startPos, prefix, name, global, reference, lastDotIndex;

	startPos = parser.pos;

	name = parser.matchPattern( /^@(?:keypath|index|key)/ );

	if ( !name ) {
		prefix = parser.matchPattern( prefixPattern ) || '';
		name = ( !prefix && parser.relaxedNames && parser.matchPattern( relaxedName ) ) ||
		       parser.matchPattern( legalReference );

		if ( !name && prefix === '.' ) {
			prefix = '';
			name = '.';
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
			v: global
		};
	}

	reference = ( prefix || '' ) + normalise( name );

	if ( parser.matchString( '(' ) ) {
		// if this is a method invocation (as opposed to a function) we need
		// to strip the method name from the reference combo, else the context
		// will be wrong
		lastDotIndex = reference.lastIndexOf( '.' );
		if ( lastDotIndex !== -1 ) {
			reference = reference.substr( 0, lastDotIndex );
			parser.pos = startPos + reference.length;
		} else {
			parser.pos -= 1;
		}
	}

	return {
		t: REFERENCE,
		n: reference.replace( /^this\./, './' ).replace( /^this$/, '.' )
	};
}
