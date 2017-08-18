/* eslint-env node */
const { reducePromiseFunctions, Ractive } = require( './util' );

const stringify = require( './parse' ).stringify;

const help = `
    component

      Read a single file component definition from STDIN or from a file via the
      -i option and compile it into an ES module to output either to STDOUT or to
      a file via the -o option. Linked stylesheets will be imported into the
      component from their external files and included alongside any style elements.
      Any script tags will be concatenated and used as the JS body of the template
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

      If you are only interested in the partials defined in and linked to the main
      file, you can reference $PARTIALS in your script and it will be replaced with
      an object containing a stringified partials object.

      -i, --input {file} - file to parse, otherwise STDIN
          This may also be a directory containing a component in index.html.
      -o, --output {file} - file to write, otherwise STDOUT
      -x, --nocsp - don't output expression functions
      -d, --delimiters {open} {close} - set the plain mustache delimiters (default {{ }})
      -s, --static {open} {close} - set the static mustache delimiters (default [[ ]])
      -r, --triple {open} {close} - set the triple mustache delimiters (default {{{ }}})
      -p, --static-triple {open} {close} - set the static triple delimiters (default [[[ ]]])
      -u, --escape-unicode - export non-ASCII characters in strings as UTF escapes
`;

function build ( string, opts, readFile ) {
	const rootOpts = Object.create( opts );
	rootOpts.interpolate = { script: false, style: false, template: false };
	const tpl = Ractive.parse( string, rootOpts );
	const partials = {};
	let script = [];
	const style = [];

	const promises = [];

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
						promises.push( readFile( src ).then( str => partials[id] = str ) );
					}
				} else if ( !type || type === 'text/javascript' || type === 'application/javascript' ) {
					const rel = getAttr( 'rel', item );
					let cssFn;

					if ( rel === 'css' ) {
						const name = getAttr( 'data-name', item ) || 'data';
						cssFn = { name, type: 'fn' };
						style.unshift( cssFn );
					}

					if ( !src ) {
						if ( cssFn ) {
							cssFn.body = item.f.join('');
						} else {
							script.unshift( item.f );
						}
					} else {
						if ( cssFn ) {
							promises.push( readFile( src ).then( str => cssFn.body = str ) );
						} else {
							script.unshift( `script!${src}` );
							promises.push( readFile( src ).then( str => script.splice( script.indexOf( `script!${src}` ), 1, str ) ) );
						}
					}
				}

				i = drop( i, tpl.t );
			} else if ( item.e === 'template' ) {
				const id = getAttr( 'id', item ) || getAttr( 'name', item );
				if ( id ) {
					partials[id] = item.f ? item.f[0] : '';
				}

				i = drop( i, tpl.t );
			} else if ( item.e === 'style' ) {
				const rel = getAttr( 'rel', item );

				if ( rel === 'ractive' ) {
					style.unshift({ type: 'tpl', body: item.f[0] });
				} else {
					style.unshift({ type: 'css', body: item.f[0] || '' });
				}

				i = drop( i, tpl.t );
			} else if ( item.e === 'link' ) {
				const href = getAttr( 'href', item );
				const type = getAttr( 'type', item );
				const rel = getAttr( 'rel', item );

				if ( href && ( type === 'component' || ( ( !type || type === 'text/css' || type === 'text/css+ractive' ) && ( rel === 'ractive' || rel === 'component' ) ) ) ) {
					const css = { type: type === 'text/css+ractive' ? 'tpl' : 'css' };
					style.unshift( css );
					promises.push( readFile( href ).then( str => css.body = str ) );
					// only links that are consumed are removed
					i = drop( i, tpl.t );
				}
			}
		}
	}

	return Promise.all( promises ).then( () => {
		script = dedent( script.join( '' ) );

		for ( const k in partials ) {
			if ( !tpl.p ) tpl.p = {};

			// just in case, don't overwrite any existing partial and skip empty partials
			if ( tpl.p[k] || !partials[k] ) continue;

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

		return Promise.all([
			compileCss( style, opts ),
			reducePromiseFunctions( opts.partialProcessors, partials ),
			reducePromiseFunctions( opts.templateProcessors, tpl )
		]).then( list => {
			script = script.replace( /\$TEMPLATE/g, stringify( list[2], opts ) );
			script = script.replace( /\$CSS/g, list[0] );
			script = script.replace( /\$PARTIALS\['([-a-zA-Z0-9_\/]+)'\]/g, (m, n) => stringify( { v: list[2].v, t: list[2].p[n] || '' }, opts ) );
			script = script.replace( /\$PARTIALS/g, stringify( list[1], opts ) );

			return reducePromiseFunctions( opts.scriptProcessors, script );
		});
	});
}

function dedent ( string ) {
	const lines = string.split( /\r\n|\r|\n/ );
	let strip = /^\s*/.exec( lines[ lines.length - 1 ] );
	if ( !strip ) return string;
	strip = strip[0];
	return lines.map( l => l.replace( strip, '' ) ).join( '\n' );
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

function compileCss( styles, opts ) {
	if ( !styles.length || !styles.join( '' ) ) return Promise.resolve( '""' );

	const promises = [];

	styles.forEach( style => {
		if ( style.type === 'tpl' ) {
			const styleOpts = Object.create( opts );
			styleOpts.textOnlyMode = true;
			style.compiled = `(function () { return this.Ractive({ template: ${stringify( Ractive.parse( style.body, styleOpts ), opts )}, data: this.cssData }).fragment.toString(false); }).call(this)`;
		} else if ( style.type === 'fn' ) {
			let indent = /^\s/.exec( style.body );
			if ( indent ) indent = indent[0];
			else indent = '  ';
			style.compiled = `(function(${style.name || 'data'}) {\n${style.body.split( /\r\n|\r|\n/ ).map( l => indent + l ).join( '\n' )}\n}).call(this, data)`;
		} else {
			promises.push( reducePromiseFunctions( opts.styleProcessors, style.body ).then( css => style.compiled = css.replace( /\s+/g, ' ' ) ) );
		}
	});

	return Promise.all( promises ).then( () => {
		const fn = styles.find( style => style.type === 'tpl' || style.type === 'fn' );

		if ( !fn ) return JSON.stringify( styles.map( style => style.compiled ).join( ' ' ) );

		return `function(data) { return [${styles.map( style => style.type === 'css' ? JSON.stringify( style.compiled ) : style.compiled ).join( ', ' )}].join(' '); }`;
	});
}

module.exports = { help, build };
