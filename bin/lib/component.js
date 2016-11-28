const fs = require( 'fs' );
const path = require( 'path' );

const stringify = require( './parse' ).stringify;

const help = `
    component

      Read a single file component definition from STDIN or from a file via the
      -i option and compile it into an ES module to output either to STDOUT or to
      a file via the -o option. Linked stylesheets will be imported into the
      component from their external files and included alongside any style elements.
      Any script tags will be concatenated an used as the JS body of the template
      file. The remaining HTML will be turned into a template and inlined into the
      script anywhere $TEMPLATE is encountered. Any aggregated css will be injected
      into the script as a JS string (JSON.stringify-ed) anywhere $CSS is
      encountered.

      Any additional script tags encountered with type text/ractive or text/html
      and an id or name attribute will be automatically turned into partials on the
      main template. <template> tags with an id attribute will also be turned into
      partials on the main template.

      script and link tags can specify the path to a file to include directly using
      the src and href attributes, respectively. Paths to remote files should be
      relative to the source file.

      -i, --input {file} - file to parse, otherwise STDIN
          This may also be a directory containing a component in index.html.
      -o, --output {file} - file to write, otherwise STDOUT
      -x, --nocsp - don't output expression functions
      -d, --delimiters {open} {close} - set the plain mustache delimiters (default {{ }})
      -s, --static {open} {close} - set the static mustache delimiters (default [[ ]])
      -r, --triple {open} {close} - set the triple mustache delimiters (default {{{ }}})
      -p, --static-triple {open} {close} - set the static triple delimiters (default [[[ ]]])
`;

function build ( Ractive, string, output, opts, base ) {
	const rootOpts = Object.create( opts );
	rootOpts.interpolate = { script: false, style: false, template: false };
	const tpl = Ractive.parse( string, rootOpts );
	const partials = {};
	let script = '';
	let style = '';

	// walk the template finding any script, style, or link tags to process them as appropriate
	let i = tpl.t.length;
	while ( i-- ) {
		const item = tpl.t[i];
		// top-level elements
		if ( item.t === 7 ) {
			if ( item.e === 'script' ) {
				const type = getAttr( 'type', item );
				const id = getAttr( 'id', item ) || getAttr( 'name', item );
				const src = getAttr( 'src', item );

				if ( id && ( type === 'text/ractive' || type === 'text/html' ) ) {
					if ( !src ) {
						partials[id] = item.f[0];
					} else {
						partials[id] = readToString( base, src );
					}
				} else if ( !type || type === 'text/javascript' || type === 'application/javascript' ) {
					if ( !src ) {
						script = item.f[0] + script;
					} else {
						script = readToString( base, src ) + script;
					}
				}

				i = drop( i, tpl.t );
			} else if ( item.e === 'template' ) {
				const id = getAttr( 'id', item ) || getAttr( 'name', item );
				if ( id ) {
					partials[id] = item.f[0];
				}

				i = drop( i, tpl.t );
			} else if ( item.e === 'style' ) {
				style = item.f[0] + style;

				i = drop( i, tpl.t );
			} else if ( item.e === 'link' ) {
				const href = getAttr( 'href', item );
				const type = getAttr( 'type', item );
				const rel = getAttr( 'rel', item );

				if ( href && ( type === 'component' || ( ( !type || type === 'text/css' ) && ( rel === 'ractive' || rel === 'component' ) ) ) ) {
					style = readToString( base, href ) + style;
					// only links that are consumed are removed
					i = drop( i, tpl.t );
				}
			}
		}
	}

	script = dedent( script );
	style = JSON.stringify( style.replace( /\s+/g, ' ' ) );
	for ( const k in partials ) {
		if ( !tpl.p ) tpl.p = {};

		// just in case, don't overwrite any existing partial
		if ( tpl.p[k] ) continue;

		const t = Ractive.parse( partials[k], opts );

		// copy any expressions
		if ( t.e ) {
			if ( !tpl.e ) tpl.e = {};
			for ( const e in t.e ) tpl.e[e] = t.e[e];
		}

		// copy any partials
		if ( t.p ) {
			for ( const p in t.p ) {
				if ( !tpl.p[p] ) tpl.p[p] = t.p[p];
			}
		}

		tpl.p[k] = t.t;
	}

	script = script.replace( /\$TEMPLATE/g, stringify( tpl ) );
	script = script.replace( /\$CSS/g, style );

	// write the output file
	output.on( 'drain', () => process.exit( 0 ) );
	output.write( script, 'utf8' );
}

function dedent ( string ) {
	const lines = string.split( /\r\n|\r|\n/ );
	let strip = /^\s*/.exec( lines[0] );
	if ( !strip ) return string;
	strip = strip[0];
	return lines.map( l => l.replace( strip, '' ) ).join( '\n' );
}

function readToString ( base, file ) {
	return fs.readFileSync( path.resolve( base, file ), { encoding: 'utf8' } );
}

const blank = /^\s*$/;
function drop ( i, tpl ) {
	tpl.splice( i, 1 );
	while ( blank.test( tpl[i] ) ) tpl.splice( i, 1 );
	let restart = i--;
	while ( blank.test( tpl[i] ) ) {
		tpl.splice( i, 1 );
		restart--;
	}
	return restart;
}

function getAttr( name, node ) {
	if ( node.m ) {
		let i = node.m.length;
		while ( i-- ) {
			const a = node.m[i];
			// plain attribute with a matching name
			if ( a.t === 13 && a.n === name && typeof a.f === 'string' ) return a.f;
		}
	}
}

module.exports = { help, build };
