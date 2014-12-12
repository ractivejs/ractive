var path = require( 'path' ),
	mkdirp = require( 'mkdirp' ),
	symlinkOrCopy = require( 'symlink-or-copy' ).sync;

// TODO this it out of keeping with other APIs and should probably
// be removed...

module.exports = function ( srcPath, destPath ) {
	mkdirp.sync( path.dirname( srcPath ) );
	mkdirp.sync( path.dirname( destPath ) );

	symlinkOrCopy( srcPath, destPath );
};
