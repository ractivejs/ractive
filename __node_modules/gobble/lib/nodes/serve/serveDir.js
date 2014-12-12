var path = require( 'path' ),
	mime = require( 'mime' ),
	sander = require( 'sander' ),
	serveFile = require( './serveFile' ),
	templates = require( './templates' );

module.exports = function serveDir( filepath, request, response ) {
	var index = path.resolve( filepath, 'index.html' );

	return sander.exists( index ).then( function ( exists ) {
		if ( exists ) {
			return serveFile( index, request, response );
		}

		return sander.readdir( filepath ).then( function ( files ) {
			var items;

			items = files.map( function ( filename ) {
				var stats, isDir;

				stats = require( 'graceful-fs' ).statSync( path.resolve( filepath, filename ) );
				isDir = stats.isDirectory();

				return {
					href: filename,
					isDir: isDir,
					type: isDir ? 'dir' : path.extname( filename )
				};
			});

			items.sort( function ( a, b ) {
				if ( ( a.isDir && b.isDir ) || ( !a.isDir && !b.isDir ) ) {
					return a.href < b.href ? 1 : -1;
				}

				return a.isDir ? -1 : 1;
			});

			return templates.dir().then( function ( dirTemplate ) {
				var html;

				html = dirTemplate({
					url: request.url,
					items: items.map( function ( item ) {
						return '<li class="' + item.type + '"><a href="' + item.href + '">' + item.href + '</a></li>';
					}).join( '' )
				});

				response.statusCode = 200;
				response.setHeader( 'Content-Type', mime.lookup( 'html' ) );
				response.setHeader( 'Content-Length', html.length );

				response.write( html );
				response.end();
			});
		});
	});
};
