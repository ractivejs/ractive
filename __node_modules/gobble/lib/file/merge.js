var fs = require( 'graceful-fs' ),
	path = require( 'path' ),
	sander = require( 'sander' ),
	resolve = path.resolve,
	Promise = sander.Promise,
	symlink = require( './symlink' );

module.exports = function () {
	var src = resolve.apply( null, arguments );

	return {
		to: function () {
			var dest = resolve.apply( null, arguments );

			return merge( src, dest );
		}
	};
};

function merge ( src, dest ) {
	return sander.stat( dest ).then( function ( stats ) {
		if ( stats.isDirectory() ) {
			// If it's a symlinked dir, we need to convert it to a real dir.
			// Suppose linked-foo/ is a symlink of foo/, and we try to copy
			// the contents of bar/ into linked-foo/ - those files will end
			// up in foo, which is definitely not what we want
			return sander.lstat( dest ).then( function ( stats ) {
				if ( stats.isSymbolicLink() ) {
					convertToRealDir( dest );
				}

				return sander.readdir( src ).then( function ( files ) {
					var promises = files.map( function ( filename ) {
						return merge( src + path.sep + filename, dest + path.sep + filename );
					});

					return Promise.all( promises );
				});
			});
		}

		// exists, and is file - overwrite
		return sander.unlink( dest ).then( link );
	}, link ); // <- failed to stat, means dest doesn't exist

	function link () {
		symlink( src, dest );
	}
}

function convertToRealDir ( symlinkPath ) {
	var originalPath = fs.realpathSync( symlinkPath );

	fs.unlinkSync( symlinkPath );
	fs.mkdirSync( symlinkPath );

	fs.readdirSync( originalPath ).forEach( function ( filename ) {
		fs.symlinkSync( originalPath + path.sep + filename, symlinkPath + path.sep + filename );
	});
}
