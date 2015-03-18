var path = require( 'path' ),
	sander = require( 'sander' ),
	Promise = sander.Promise,
	gobble = require( 'gobble' );



module.exports = gobble([
	gobble( 'src/vendor' ),

	// old versions
	gobble( 'old-versions' ).moveTo( 'builds' ),

	// control build
	gobble( 'control' ).moveTo( 'builds/control' ),

	// most recent build
	gobble( '../build' ).moveTo( 'builds/edge' ),

	gobble( 'tests' ).transform( 'es6-transpiler', {
		disallowUnknownReferences: false
	}).transform( function ( inputdir, outputdir, options ) {
		var pageTemplate, indexTemplate;

		pageTemplate = makeTemplate( sander.readFileSync( 'src/templates/testpage.html' ).toString() );
		indexTemplate = makeTemplate( sander.readFileSync( 'src/templates/index.html' ).toString() );

		return sander.lsr( inputdir ).then( function ( files ) {
			var promises, list = '<ul>';

			// create individual test pages
			promises = files.map( function ( file ) {
				var name = file.replace( /\.js$/, '' );

				list += '<li><a href="' + name + '.html">' + name + '</a></li>';

				return sander.readFile( inputdir, file ).then( function ( suite ) {
					var html;

					html = pageTemplate({
						name: name,
						srcPrefix: name.split( path.sep ).map( function () { return '..' }).join( '/' ),
						suite: suite
					});

					return sander.writeFile( outputdir, name + '.html', html );
				});
			});

			list += '</ul>';

			// create index page
			promises.push(
				sander.writeFile( outputdir, 'index.html', indexTemplate({ list: list }) )
			);

			return Promise.all( promises );
		});
	}),

	gobble( 'src/app' ).transform( 'es6-transpiler', {
		disallowUnknownReferences: false
	})
]);


function makeTemplate ( str ) {
	return function ( data ) {
		return str.replace( /<%=\s*(\S+)\s*%>/g, function ( match, $1 ) {
			return $1 in data ? data[ $1 ] : match;
		});
	};
}
