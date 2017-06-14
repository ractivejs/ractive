/* eslint-env node */
const { reducePromiseFunctions, Ractive } = require( './util' ).Ractive;

const help = `
    parse

      Read a template on STDIN or from a file via the -i option, and output JSON or
      a similar JS object, depending on the CSP flag and whether or not there are
      expressions in the template, to STDOUT or a file via the -o option.

      -i, --input {file} - file to parse, otherwise STDIN
      -o, --output {file} - file to write, otherwise STDOUT
      -t, --text-only - text only
      -x, --nocsp - don't output expression functions
      -d, --delimiters {open} {close} - set the plain mustache delimiters (default {{ }})
      -s, --static {open} {close} - set the static mustache delimiters (default [[ ]])
      -r, --triple {open} {close} - set the triple mustache delimiters (default {{{ }}})
      -p, --static-triple {open} {close} - set the static triple delimiters (default [[[ ]]])
      -u, --escape-unicode - export non-ASCII characters in strings as UTF escapes
`;

function parse ( string, opts ) {
	const tpl = Ractive.parse( string, opts );
	if ( opts.templateProcessors ) return reducePromiseFunctions( opts.templateProcessors, tpl ).then( tpl => {
		stringify( tpl, opts );
	});
	else return Promise.resolve( stringify( tpl, opts ) );
}

// https://gist.github.com/mathiasbynens/1243213
function escape ( string ) {
	return string.replace( /[^]/g, char => {
		const code = char.charCodeAt();

		if ( code < 256 ) return char;

		const escape = code.toString(16);
		const long = escape.length > 2;
		return `\\${long ? 'u' : 'x'}${('0000' + escape).slice( long ? -4 : -2 )}`;
	});
}

const ident = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
function safeKey ( string ) {
	if (ident.test(string)) return string;
	else return JSON.stringify(string);
}

function stringify ( tpl, opts ) {
	let result;

	if ( tpl.e ) {
		let str = '{';
		let i = 0;
		for ( const k in tpl ) {
			if ( i++ > 0 ) str += ',';
			if ( k === 'e' ) {
				str += 'e:{';
				let i = 0;
				for ( const k in tpl.e ) {
					if ( i++ > 0 ) str += ',';
					str += `${JSON.stringify(k)}:${tpl.e[k].toString()}`;
				}
				str += '}';
			} else {
				str += `${safeKey(k)}:${toString( tpl[k], opts )}`;
			}
		}
		result = str + '}';
	} else {
		result = toString( tpl, opts );
	}

	if ( opts && opts.escapeUnicode ) result = escape( result );

	return result;
}

function toString ( thing, opts ) {
	if ( Array.isArray( thing ) ) {
		return '[' + thing.map( v => toString( v, opts ) ).join( ',' ) + ']';
	} else if ( typeof thing === 'object' ) {
		let str = '{';
		let trail = false;
		for ( const k in thing ) {
			if ( thing[k] === undefined ) continue;
			if ( trail ) str += ',';
			str += safeKey(k) + ':' + stringify( thing[k], opts );
			trail = true;
		}
		str += '}';
		return str;
	} else {
		return JSON.stringify( thing );
	}
}

module.exports = { help, parse, stringify };
