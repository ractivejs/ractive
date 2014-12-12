module.exports = function handleRequest ( srcDir, error, request, response ) {
	var join = require( 'path' ).join,
		sander = require( 'sander' ),
		serveFile = require( './serveFile' ),
		serveDir = require( './serveDir' ),
		serveError = require( './serveError' ),
		message,
		parsedUrl = require( 'url' ).parse( request.url ),
		pathname = parsedUrl.pathname,
		filepath;

	if ( error ) {
		if ( pathname.substr( 0, 11 ) === '/__gobble__' ) {
			message = ( error.original && error.original.message ) || error.message || '';
			filepath = pathname.substring( 11 );

			// only allow links to files that we're actually interested in, not
			// the whole damn filesystem
			if ( ~message.indexOf( filepath ) || ~error.stack.indexOf( filepath ) ) {
				return serveFile( pathname.substring( 11 ), request, response );
			}
		}

		serveError( error, request, response );
		return sander.Promise.resolve();
	}

	filepath = join( srcDir, pathname );

	return sander.stat( filepath ).then( function ( stats ) {
		if ( stats.isDirectory() ) {
			// might need to redirect from `foo` to `foo/`
			if ( pathname.slice( -1 ) !== '/' ) {
				response.setHeader( 'Location', pathname + '/' + ( parsedUrl.search || '' ) );
				response.writeHead( 301 );

				response.end();
			} else {
				return serveDir( filepath, request, response );
			}
		}

		else {
			return serveFile( filepath, request, response );
		}
	}, function ( err ) {
		return serveError( err, request, response );
	});
};
