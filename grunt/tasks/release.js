module.exports = function ( grunt ) {

	'use strict';

	grunt.registerTask( 'release', [ 'default', 'copy:release', 'copy:link' ] );

};