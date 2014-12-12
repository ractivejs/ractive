module.exports = {
	dir: make( 'dir.html' ),
	err: make( 'err.html' ),
	notfound: make( 'notfound.html' ),
	waiting: make( 'waiting.html' )
};

function make( filename ) {
	var promise, sander = require( 'sander' );

	return function () {
		if ( !promise ) {
			promise = sander.readFile( __dirname, filename ).then( function ( result ) {
				var template = result.toString();

				return function ( data ) {
					return template.replace( /\$\{([^\}]+)\}/g, function ( match, $1 ) {
						return data.hasOwnProperty( $1 ) ? data[ $1 ] : match;
					});
				};
			});
		}

		return promise;
	};
}
