define([
	'circular',
	'utils/get',
	'utils/promise',
	'utils/resolvePath',
	'parse/_parse',
	'load/getName'
], function (
	circular,
	get,
	promise,
	resolvePath,
	parse,
	getName
) {

	'use strict';

	var Ractive, importDirectivePattern;

	importDirectivePattern = /^\s*@import\s+(?:(?:'([^']+)')|(?:"([^"]+)")|([^\s]+))(?:\s+as\s+([^\s]+))?\s*$/mg;

	circular.push( function () {
		Ractive = circular.Ractive;
	});

	var makeComponent = function ( template, path ) {
		var scripts,
			script,
			styles,
			i,
			item,
			scriptElement,
			oldModule,
			factory,
			Component,
			pendingImports,
			imports,
			importPromise;

		pendingImports = 0;
		imports = {};

		importPromise = promise( function ( resolve, reject ) {

			// first, extract any @import directives
			template = template.replace( importDirectivePattern, function ( match, singleQuotedPath, doubleQuotedPath, unquotedPath, name ) {
				var relativePath, resolvedPath;

				relativePath = singleQuotedPath || doubleQuotedPath || unquotedPath;
				resolvedPath = resolvePath( relativePath, path );

				name = name || getName( resolvedPath );

				// import this component, or call `reject`
				pendingImports += 1;
				get( resolvedPath ).then( function ( template ) {
					return makeComponent( template, resolvedPath );
				}).then( function ( Component ) {
					imports[ name ] = Component;

					if ( !--pendingImports ) {
						resolve( imports );
					}
				}, reject );

				return '';
			});

			if ( !pendingImports ) {
				resolve( imports );
			}
		});

		template = parse( template );

		scripts = [];
		styles = [];
		i = template.length;
		while ( i-- ) {
			item = template[i];

			if ( item && item.t === 7 ) {
				if ( item.e === 'script' && ( !item.a || !item.a.type || item.a.type === 'text/javascript' ) ) {
					scripts.push( template.splice( i, 1 )[0] );
				}

				if ( item.e === 'style' && ( !item.a || !item.a.type || item.a.type === 'text/css' ) ) {
					styles.push( template.splice( i, 1 )[0] );
				}
			}
		}

		// TODO glue together text nodes, where applicable
		// TODO check style and script tags don't have mustaches!

		// extract script
		script = scripts.map( extractFragment ).join( ';' );

		// once all subcomponents have been imported (if any), create this component
		return importPromise.then( function ( imports ) {
			if ( script ) {
				scriptElement = document.createElement( 'script' );
				scriptElement.innerHTML = '(function () {' + script + '}());';

				oldModule = window.module;

				window.module = {};
				document.head.appendChild( scriptElement );

				factory = window.module.exports;
				Component = factory( Ractive, template, imports );
			} else {
				Component = Ractive.extend({ template: template, components: imports });
			}

			Component.css = styles.map( extractFragment ).join( ' ' );

			window.module = oldModule;

			return Component;
		});
	};

	return makeComponent;

	function extractFragment ( item ) {
		return item.f;
	}

});