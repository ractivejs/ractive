var mime = require( 'mime' ),
	sander = require( 'sander' );

module.exports = function serveFile ( filepath, request, response ) {
	return sander.readFile( filepath ).then( function ( data ) {
		response.statusCode = 200;
		response.setHeader( 'Content-Type', mime.lookup( filepath ) );
		response.setHeader( 'Content-Length', data.length );

		response.write( data );
		response.end();
	});
};
