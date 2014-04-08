module.exports = function ( grunt ) {

	'use strict';

	grunt.registerTask( 'revision', 'Set revision to grunt config pkg.version', function () {
		grunt.event.once('git-describe', function (rev) {
			grunt.config('pkg.version', rev.toString());
		});
		grunt.task.run('git-describe');
	});

};