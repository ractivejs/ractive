/*
 * grunt-gobble
 * http://gobble.technology
 *
 * Copyright (c) 2014 Rich Harris
 * Licensed under the MIT license.
 */

var messages = {
 	BUILD_INVALIDATED: function ( x ) {
 		return f( 'build invalidated (%s). restarting', summariseChanges( x.changes ) );
 	},

 	BUILD_START: function () {
 		return 'build started';
 	},

 	BUILD_COMPLETE: function ( x ) {
 		var result = ( x.dest ? 'built to ' + x.dest : 'build completed' ) + ' in ' + x.duration + 'ms';

 		if ( x.watch ) {
 			result += '. Listening for changes...\n';
 		}

 		return result;
 	},

 	GOBBLEFILE_CHANGED: function () {
 		return 'gobblefile changed. restarting server';
 	},

 	MERGE_START: function ( x ) {
 		return x.id + ' running...';
 	},

 	MERGE_COMPLETE: function ( x ) {
 		return x.id + ' done in ' + x.duration + 'ms';
 	},

 	LIVERELOAD_RUNNING: function () {
 		return 'livereload server running';
 	},

 	SERVER_LISTENING: function ( x ) {
 		return 'server listening on port ' + x.port;
 	},

 	TRANSFORM_START: function ( x ) {
 		return x.id + ' running...';
 	},

 	TRANSFORM_COMPLETE: function ( x ) {
 		return x.id + ' done in ' + x.duration + 'ms';
 	}
};

module.exports = function( grunt ) {

	'use strict';

	grunt.registerMultiTask( 'gobble', 'The last build tool you\'ll ever need', function () {

		var done = this.async(),
			path = require( 'path' ),
			env,
			node,
			task;

		if ( env = ( this.data.environment || this.data.env ) ) {
			process.env.GOBBLE_ENV = env;
		}

		if ( this.data.config ) {
			if ( typeof this.data.config === 'string' ) {
				node = require( path.resolve( this.data.config ) );
			} else if ( typeof this.data.config === 'function' ) {
				node = this.data.config();
			} else {
				throw new Error( 'The grunt-gobble config option, if specified, must be a function that returns a gobble node or a string (path to a build definition)' );
			}
		} else {
			node = require( path.resolve( 'gobblefile.js' ) );
		}

		if ( this.args[0] === 'serve' ) {
			task = node.serve({
				port: this.data.port || 4567,
				gobbledir: this.data.gobbledir
			});
		}

		else {
			if ( !this.data.dest ) {
				grunt.fatal( 'You must specify a destination directory, e.g. `dest: "output"`' );
			}

			task = node.build({
				dest: this.data.dest,
				gobbledir: this.data.gobbledir,
				force: this.data.force
			});

			task.then( done );
		}

		task.on( 'info', function ( details ) {
			var fn, message;

			if ( typeof details === 'string' ) {
				grunt.log.ok( details );
			} else {
				fn = messages[ details.code ];

				if ( fn ) {
					message = fn( details );
					grunt.log.ok( message );
				}
			}
		});
		task.on( 'warning', grunt.log.debug );
		task.on( 'error', grunt.fatal );

	});

};
