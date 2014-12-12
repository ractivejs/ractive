var templates = require( './templates' ),
	colors = {},
	entities;

entities = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;',
	'/': '&#x2F;'
};

colors = {
	37: 'white',
	90: 'grey',
	30: 'black',
	34: 'blue',
	36: 'cyan',
	32: 'green',
	35: 'magenta',
	31: 'red',
	33: 'yellow'
};


module.exports = function serveError ( error, request, response ) {
	if ( error.gobble === 'WAITING' ) {
		templates.waiting().then( function ( template ) {
			response.statusCode = 420;
			response.write( template() );

			response.end();
		});
	}

	else if ( error.code === 'ENOENT' ) {
		templates.notfound().then( function ( template ) {
			var html = template({
				path: error.path
			});

			response.statusCode = 404;
			response.write( html );

			response.end();
		});
	}

	else {
		templates.err().then( function ( template ) {
			var html, id, message, filename;

			id = error.id;
			message = escape( error.original ? error.original.message || error.original : error );
			filename = error.original ? error.original.filename : error.filename;

			html = template({
				id: id,
				message: message.replace( /\[(\d+)m/g, function ( match, $1 ) {
					var color;

					if ( match === '[39m' ) {
						return '</span>';
					}

					if ( color = colors[ $1 ] ) {
						return '<span style="color:' + color + ';">';
					}

					return '';
				}), // remove colors
				stack: prepareStack( error.stack ),
				filemessage: filename ? '<p>The error occurred while processing <strong>' + filename + '</strong>.</p>' : ''
			});

			// turn filepaths into links
			html = html.replace( /([>\s\(])(&#x2F[^\s\):<]+)/g, function ( match, $1, $2 ) {
				return $1 + '<a href="/__gobble__' + $2 + '">' + $2 + '</a>';
			});

			response.statusCode = 500;
			response.write( html );

			response.end();
		});
	}
};

function prepareStack ( stack ) {
	return stack.split( '\n' ).filter( function ( line ) {
		return line !== 'Error';
	}).map( function ( line ) {
		return '<li>' + escape( line.trim() ) + '</li>';
	}).join( '' );
}

function escape ( str ) {
	return ( str || '' ).replace( /[&<>"'\/]/g, function ( char ) {
		return entities[ char ];
	});
}
