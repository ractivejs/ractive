define([
	'circular',
	'utils/get',
	'utils/Promise',
	'utils/resolvePath',
	'parse/_parse',
	'load/getName'
], function (
	circular,
	get,
	Promise,
	resolvePath,
	parse,
	getName
) {

	'use strict';

	var Ractive;

	circular.push( function () {
		Ractive = circular.Ractive;
	});

	var makeComponent = function ( template, baseUrl ) {
		var links,
			scripts,
			script,
			styles,
			i,
			item,
			scriptElement,
			oldComponent,
			exports,
			Component,
			pendingImports,
			imports,
			importPromise;

		template = parse( template, {
			noStringify: true,
			interpolateScripts: false,
			interpolateStyles: false
		});

		links = [];
		scripts = [];
		styles = [];

		i = template.length;
		while ( i-- ) {
			item = template[i];

			if ( item && item.t === 7 ) {
				if ( item.e === 'link' && ( item.a && item.a.rel[0] === 'ractive' ) ) {
					links.push( template.splice( i, 1 )[0] );
				}

				if ( item.e === 'script' && ( !item.a || !item.a.type || item.a.type[0] === 'text/javascript' ) ) {
					scripts.push( template.splice( i, 1 )[0] );
				}

				if ( item.e === 'style' && ( !item.a || !item.a.type || item.a.type[0] === 'text/css' ) ) {
					styles.push( template.splice( i, 1 )[0] );
				}
			}
		}


		// import any sub-components
		pendingImports = links.length;
		imports = {};

		importPromise = new Promise( function ( resolve, reject ) {

			links.forEach( function ( link ) {
				var href, name, resolvedPath;

				href = link.a.href && link.a.href[0];
				name = ( link.a.name && link.a.name[0] ) || getName( href );

				if ( typeof name !== 'string' ) {
					reject( 'Error parsing link tag' );
					return;
				}

				resolvedPath = resolvePath( href, baseUrl );

				get( resolvedPath ).then( function ( template ) {
					return makeComponent( template, resolvedPath );
				}).then( function ( Component ) {
					imports[ name ] = Component;

					if ( !--pendingImports ) {
						resolve( imports );
					}
				}, reject );
			});

			if ( !pendingImports ) {
				resolve( imports );
			}
		});

		// TODO glue together text nodes, where applicable

		// extract script
		script = scripts.map( extractFragment ).join( ';' );

		// once all subcomponents have been imported (if any), create this component
		return importPromise.then( function ( imports ) {
			var head = document.getElementsByTagName( 'head' )[0];

			Component = Ractive.extend({ template: template, components: imports });

			if ( script ) {
				scriptElement = document.createElement( 'script' );
				scriptElement.innerHTML = '(function () {' + script + '}());';

				oldComponent = window.component;

				window.component = {};
				head.appendChild( scriptElement );

				exports = window.component.exports;

				if ( typeof exports === 'function' ) {
					Component = exports( Component );
				} else if ( typeof exports === 'object' ) {
					Component = Component.extend( exports );
				}

				head.removeChild( scriptElement );
				window.component = oldComponent;
			}

			if ( styles.length ) {
				Component.css = styles.map( extractFragment ).join( ' ' );
			}

			return Component;
		});
	};

	return makeComponent;

	function extractFragment ( item ) {
		return item.f;
	}

});