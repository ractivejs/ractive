var methods = {
	amd: 'toAmd',
	cjs: 'toCjs',
	umd: 'toUmd'
};

module.exports = function esperantoBundle ( inputdir, outputdir, options ) {
	var sander = require( 'sander' ),
		path = require( 'path' ),
		esperanto = require( 'esperanto' ),
		method = methods[ options.type ] || 'toAmd',
		dest;

	if ( !options.entry ) {
		throw new Error( "The gobble-esperanto-bundle config must specify an entry module (e.g. `{ entry: 'main' }`)" );
	}

	options.base = path.join( inputdir, options.base || '' );
	dest = ( options.dest || options.entry ).replace( /\.js$/, '' ) + '.js';

	if ( !options.hasOwnProperty( 'sourceMap' ) ) {
		options.sourceMap = true;
	}

	if ( options.sourceMap ) {
		options.sourceMapFile = dest;
	}

	return esperanto.bundle( options ).then( function ( bundle ) {
		var result = bundle[ method ]( options ), promises = [];

		promises.push( sander.writeFile( outputdir, dest, result.code ) );

		if ( result.map ) {
			promises.push( sander.writeFile( outputdir, dest + '.map', result.map.toString() ) );
		}

		return sander.Promise.all( promises );
	});
};
