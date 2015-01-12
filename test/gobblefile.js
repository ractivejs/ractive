var gobble = require( 'gobble' ),
	path = require( 'path' ),
	sander = require( 'sander' ),
	Promise = sander.Promise,
	esperanto = require( 'esperanto' ),
	globals = JSON.parse( sander.readFileSync( __dirname, '.jshintrc' ).toString() ).globals,
	templates,
	testModules,
	testPages;

gobble.cwd( __dirname );

function compileTemplate ( str ) {
	return function ( data ) {
		return str.replace( /\${([^}]+)}/g, function ( match, $1 ) {
			return $1 in data ? data[ $1 ] : match;
		});
	};
}

function getPathPrefix ( mod ) {
	return mod.split( path.sep ).map( function () { return '..'; }).join( '/' );
}

templates = {
	testpage: compileTemplate( sander.readFileSync( __dirname, 'templates/testpage.html' ).toString() ),
	index: compileTemplate( sander.readFileSync( __dirname, 'templates/index.html' ).toString() )
};

testModules = gobble([
	gobble( '__tests' ).moveTo( '__tests' ),
	gobble( 'testdeps' ),
	gobble( '../src' )
]).transform( function bundleTests ( inputdir, outputdir, options ) {
	return sander.lsr( inputdir, '__tests' ).then( function ( testModules ) {
		var promises = testModules.map( function ( mod ) {
			return esperanto.bundle({
				base: inputdir,
				entry: '__tests/' + mod
			}).then( function ( bundle ) {
				return sander.writeFile( outputdir, mod, bundle.concat({}).code );
			});
		});

		return Promise.all( promises ).then( function () {
			// index page
			var index = templates.index({
				scriptBlock: testModules.map( function ( src ) {
					return '<script src="' + src + '"></script>';
				}).join( '\n\t' )
			});

			return sander.writeFile( outputdir, 'index.html', index );
		});
	});
})
.transform( 'es6-transpiler', {
	globals: globals,
	disallowDuplicated: false,
	onError: function ( errors ) {
		// es6-transpiler is not especially clever about dealing with
		// references it doesn't expect. This squelches errors we expect
		// to encounter
		errors.forEach( function ( error ) {
			if ( /referenced before its declaration/.test( error ) ) return;
			throw new Error( error );
		});
	}
});

testPages = testModules.transform( function () {
	return templates.testpage({
		testModule: path.basename( this.filename ),
		name: this.filename.replace( /\.js$/, '' ),
		pathPrefix: getPathPrefix( this.filename )
	});
}, { accept: '.js', ext: '.html' });

module.exports = gobble([
	testModules,
	testPages,
	gobble( 'root' ),
	gobble( '__nodetests' ).moveTo( '__nodetests' ),
	gobble( 'testdeps/samples' )
		.include( '*.js' )
		.transform( 'esperanto', { type: 'cjs', sourceMap: false })
		.transform( 'es6-transpiler' )
		.moveTo( '__nodetests/samples' )
]).moveTo( 'test' );
