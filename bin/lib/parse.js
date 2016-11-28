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

function parse ( Ractive, string, output, opts ) {
	const tpl = Ractive.parse( string, opts );
	output.on( 'drain', () => process.exit( 0 ) );
	output.write( stringify( tpl ), 'utf8' );
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
				str += `${JSON.stringify(k)}:${JSON.stringify(tpl[k])}`;
			}
		}
		return str + '}';
	} else {
		return JSON.stringify( tpl );
	}
}

module.exports = { help, parse, stringify };
