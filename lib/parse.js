const Ractive = require( './util' ).Ractive;

const help = `
    parse

      Read a template on STDIN or from a file via the -i option, and output JSON or
      a similar JS object, depending on the CSP flag and whether or not there are
      expressions in the template, to STDO out or a file via the -o option.

      -i, --input {file} - file to parse, otherwise STDIN
      -o, --output {file} - file to write, otherwise STDOUT
      -t, --text-only - text only
      -x, --nocsp - don't output expression functions
      -d, --delimiters {open} {close} - set the plain mustache delimiters (default {{ }})
      -s, --static {open} {close} - set the static mustache delimiters (default [[ ]])
      -r, --triple {open} {close} - set the triple mustache delimiters (default {{{ }}})
      -p, --static-triple {open} {close} - set the static triple delimiters (default [[[ ]]])
`;

function parse ( string, opts ) {
	const tpl = Ractive.parse( string, opts );
	return Promise.resolve( stringify( tpl ) );
}

function stringify ( tpl ) {
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
				str += `${k}:${toString(tpl[k])}`;
			}
		}
		return str + '}';
	} else {
		return toString( tpl );
	}
}

function toString ( thing ) {
	if ( Array.isArray( thing ) ) {
		return '[' + thing.map( toString ).join( ',' ) + ']';
	} else if ( typeof thing === 'object' ) {
		let str = '{';
		let trail = false;
		for ( const k in thing ) {
			if ( trail ) str += ',';
			str += k + ':' + stringify( thing[k] );
			trail = true;
		}
		str += '}';
		return str;
	} else {
		return JSON.stringify( thing );
	}
}

module.exports = { help, parse, stringify };
