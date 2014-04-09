module.exports = function ( grunt ) {

	'use strict';

	grunt.registerTask( 'revision', 'Set revision to grunt config pkg.version', function () {
		var done = this.async();

		require( 'child_process' ).exec( 'git rev-parse HEAD', function ( err, commitHash ) {
			if ( err ) {
				done( err );
				return;
			}

			grunt.config( 'commitHash', commitHash );
			done();
		});
	});

};
