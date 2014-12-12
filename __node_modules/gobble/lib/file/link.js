var resolve = require( 'path' ).resolve,
	path = require( 'path' ),
	sander = require( 'sander' ),
	symlinkOrCopy = require( 'symlink-or-copy' ).sync;

module.exports = function () {
	var src = resolve.apply( null, arguments );

	return {
		to: function () {
			var dest = resolve.apply( null, arguments );

			return sander.mkdir( path.dirname( dest ) ).then( function () {
				symlinkOrCopy( src, dest );
			});
		}
	};
};
