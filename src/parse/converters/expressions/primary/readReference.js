import { GLOBAL, REFERENCE } from '../../../../config/types';
import { normalise } from '../../../../shared/keypaths';
import { legalReference, relaxedName } from '../shared/patterns';

// if a reference is a browser global, we don't deference it later, so it needs special treatment
const globals = /^(?:Array|console|Date|RegExp|decodeURIComponent|decodeURI|encodeURIComponent|encodeURI|isFinite|isNaN|parseFloat|parseInt|JSON|Math|NaN|undefined|null|Object|Number|String|Boolean)\b/;

// keywords are not valid references, with the exception of `this`
const keywords = /^(?:break|case|catch|continue|debugger|default|delete|do|else|finally|for|function|if|in|instanceof|new|return|switch|throw|try|typeof|var|void|while|with)$/;

const prefixPattern = /^(?:\@\.|\@|~\/|(?:\^\^\/(?:\^\^\/)*(?:\.\.\/)*)|(?:\.\.\/)+|\.\/(?:\.\.\/)*|\.)/;
const specials = /^(key|index|keypath|rootpath|this|global|shared)/;
const specialCall = /^\s*\(/;

export default function readReference ( parser ) {
	let prefix, name, global, reference, lastDotIndex;

	const startPos = parser.pos;

	prefix = parser.matchPattern( prefixPattern ) || '';
	name = ( !prefix && parser.relaxedNames && parser.matchPattern( relaxedName ) ) ||
			parser.matchPattern( legalReference );
	const actual = prefix.length + ( ( name && name.length ) || 0 );

	if ( prefix === '@.' ) {
		prefix = '@';
		if ( name ) name = 'this.' + name;
		else name = 'this';
	}

	if ( !name && prefix ) {
		name = prefix;
		prefix = '';
	}

	if ( !name ) {
		return null;
	}

	if ( prefix === '@' ) {
		if ( name === 'keypath' || name === 'rootpath' ) {
			if ( parser.matchPattern( specialCall ) ) {
				const ref = readReference( parser );
				if ( !ref ) parser.error( `Expected a valid reference for a keypath expression` );

				parser.allowWhitespace();

				if ( !parser.matchString( ')' ) ) parser.error( `Unclosed keypath expression` );
				name += `(${ref.n})`;
			}
		} else if ( !specials.test( name ) ) {
			parser.error( `Unrecognized special reference @${name}` );
		}
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
		// but only if the reference was actually a member and not a refinement
		lastDotIndex = reference.lastIndexOf( '.' );
		if ( lastDotIndex !== -1 && name[ name.length - 1 ] !== ']' ) {
			const refLength = reference.length;
			reference = reference.substr( 0, lastDotIndex );
			parser.pos = startPos + ( actual - ( refLength - lastDotIndex ) );
		} else {
			parser.pos -= 1;
		}
	}

	return {
		t: REFERENCE,
		n: reference.replace( /^this\./, './' ).replace( /^this$/, '.' )
	};
}
