var EventEmitter2 = require( 'eventemitter2' ).EventEmitter2,
	sander = require( 'sander' ),
	path = require( 'path' ),
	requireRelative = require( 'require-relative' ),
	builtins = require( '../builtins' ),
	nodes = require( './index' ),

	config = require( '../config' ),
	GobbleError = require( '../utils/GobbleError' ),
	assign = require( '../utils/assign' ),
	warnOnce = require( '../utils/warnOnce' ),

	serve = require( './serve' ),
	build = require( './build' ),
	watch = require( './watch' );

var Node = function () {};

Node.prototype = assign( Object.create( EventEmitter2.prototype ), {
	_gobble: true, // way to identify gobble trees, even with different copies of gobble (i.e. local and global) running simultaneously

	// This gets overwritten each time this.ready is overwritten. Until
	// the first time that happens, it's a noop
	_abort: function () {},

	_findCreator: function () {
		return this;
	},

	build: function ( options ) {
		return build( this, options );
	},

	createWatchTask: function () {
		var node = this, watchTask, buildScheduled;

		watchTask = new EventEmitter2({ wildcard: true });

		// TODO is this the best place to handle this stuff? or is it better
		// to pass off the info to e.g. gobble-cli?
		node.on( 'info', function ( details ) {
			watchTask.emit( 'info', details );
		});

		node.on( 'error', handleError );

		function build () {
			var buildStart = Date.now();

			buildScheduled = false;

			node.ready().then( function ( d ) {
				watchTask.emit( 'info', {
					code: 'BUILD_COMPLETE',
					duration: Date.now() - buildStart,
					watch: true
				});

				watchTask.emit( 'built', d );
			}).catch( handleError );
		}

		function handleError ( e ) {
			if ( e.code === 'MERGE_ABORTED' ) {
				return;
			}

			if ( e.code === 'INVALIDATED' ) {
				// A node can depend on the same source twice, which will result in
				// simultaneous rebuilds unless we defer it to the next tick
				if ( !buildScheduled ) {
					buildScheduled = true;
					watchTask.emit( 'info', {
						code: 'BUILD_INVALIDATED',
						changes: e.changes
					});//util.format( 'build invalidated (%s). restarting', summariseChanges( e.changes ) ) );

					process.nextTick( build );
				}
			} else {
				watchTask.emit( 'error', e );
			}
		}

		watchTask.close = function () {
			node.stop();
		};

		this.start();
		build();

		return watchTask;
	},

	exclude: function ( patterns ) {
		if ( typeof patterns === 'string' ) { patterns = [ patterns ]; }
		return new nodes.Transformer( this, builtins.include, { patterns: patterns, exclude: true });
	},

	grab: function () {
		var src = path.join.apply( path, arguments );
		return new nodes.Transformer( this, builtins.grab, { src: src });
	},

	// Built-in transformers
	include: function ( patterns ) {
		if ( typeof patterns === 'string' ) { patterns = [ patterns ]; }
		return new nodes.Transformer( this, builtins.include, { patterns: patterns });
	},

	inspect: function ( target, options ) {
		target = path.resolve( config.cwd, target );

		if ( options && options.clean ) {
			sander.rimraf( target );
		}

		this.inspectTargets.push( target );
		return this; // chainable
	},

	map: function ( fn, userOptions ) {
		warnOnce( 'node.map() is deprecated. You should use node.transform() instead for both file and directory transforms' );
		return this.transform( fn, userOptions );
	},

	moveTo: function () {
		var dest = path.join.apply( path, arguments );
		return new nodes.Transformer( this, builtins.move, { dest: dest });
	},

	serve: function ( options ) {
		return serve( this, options );
	},

	transform: function ( fn, userOptions ) {
		var options;

		if ( typeof fn === 'string' ) {
			fn = tryToLoad( fn );
		}

		// If function takes fewer than 3 arguments, it's a file transformer
		if ( fn.length < 3 ) {

			options = assign({}, fn.defaults, userOptions, {
				cache: {},
				fn: fn,
				userOptions: assign( {}, userOptions )
			});

			if ( typeof options.accept === 'string' ) {
				options.accept = [ options.accept ];
			}

			return new nodes.Transformer( this, builtins.map, options, fn.id || fn.name );
		}

		// Otherwise it's a directory transformer
		return new nodes.Transformer( this, fn, userOptions );
	},

	watch: function ( options ) {
		return watch( this, options );
	}
});

Node.extend = function ( methods ) {
	var Child;

	Child = function () {
		EventEmitter2.call( this, {
			wildcard: true
		});

		this.counter = 1;
		this.inspectTargets = [];

		this.init.apply( this, arguments );
	};

	Child.prototype = Object.create( Node.prototype );

	Object.keys( methods ).forEach( function ( key ) {
		Child.prototype[ key ] = methods[ key ];
	});

	return Child;
};

module.exports = Node;


function tryToLoad ( plugin ) {
	var gobbleError;

	try {
		return requireRelative( 'gobble-' + plugin, process.cwd() );
	} catch ( err ) {
		if ( err.message === "Cannot find module 'gobble-" + plugin + "'" ) {
			gobbleError = new GobbleError({
				message: 'Could not load gobble-' + plugin + ' plugin',
				code: 'PLUGIN_NOT_FOUND',
				plugin: plugin
			});

			throw gobbleError;
		} else {
			throw err;
		}
	}
}
