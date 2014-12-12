var path = require( 'path' ),
	sander = require( 'sander' ),
	mapSeries = require( 'promise-map-series' ),
	Node = require( './Node' ),

	session = require( '../session' ),

	merge = require( '../file/merge' ),
	uid = require( '../utils/uid' ),
	GobbleError = require( '../utils/GobbleError' );

module.exports = Node.extend({
	init: function ( inputs, options ) {
		var node = this;

		node.inputs = inputs;

		node.inspectTargets = [];
		node.id = uid( ( options && options.id ) || 'merge' );

		node.counter = 1;
	},

	ready: function () {
		var node = this, aborted, index, outputdir;

		if ( !node._ready ) {
			node._abort = function () {
				// allows us to short-circuit operations at various points
				aborted = new GobbleError({
					code: 'MERGE_ABORTED',
					id: node.id,
					message: 'merge aborted'
				});

				node._ready = null;
			};

			index = node.counter++;
			outputdir = path.resolve( session.config.gobbledir, node.id, '' + index );

			node._ready = sander.mkdir( outputdir ).then( function () {
				var start, inputdirs = [];

				return mapSeries( node.inputs, function ( input, i ) {
					if ( aborted ) throw aborted;

					return input.ready().then( function ( inputdir ) {
						inputdirs[i] = inputdir;
					});
				}).then( function () {
					start = Date.now();

					node.emit( 'info', {
						code: 'MERGE_START',
						id: node.id,
						progressIndicator: true
					});

					return mapSeries( inputdirs, function ( inputdir ) {
						if ( aborted ) throw aborted;
						return merge( inputdir ).to( outputdir );
					});
				}).then( function () {
					if ( aborted ) throw aborted;

					node._cleanup( index );

					node.emit( 'info', {
						code: 'MERGE_COMPLETE',
						id: node.id,
						duration: Date.now() - start
					});

					return outputdir;
				});
			});
		}

		return node._ready;
	},

	start: function () {
		var node = this;

		if ( node._active ) {
			return;
		}

		node._active = true;

		node._onerror = function ( err ) {
			node._abort();
			node.emit( 'error', err );
		};

		node._oninfo = function ( details ) {
			node.emit( 'info', details );
		};

		node.inputs.forEach( function ( input ) {
			input.on( 'error', node._onerror );
			input.on( 'info', node._oninfo );

			input.start();
		});
	},

	stop: function () {
		var node = this;

		node.inputs.forEach( function ( input ) {
			input.off( 'error', node._onerror );
			input.off( 'info', node._oninfo );

			input.stop();
		});

		node._active = false;
	},

	_cleanup: function ( index ) {
		var node = this, dir = path.join( session.config.gobbledir, node.id );

		// Remove everything except the last successful output dir.
		// Use readdirSync to eliminate race conditions
		sander.readdirSync( dir ).filter( function ( file ) {
			return file !== '.cache' && ( +file < index );
		}).forEach( function ( file ) {
			sander.rimrafSync( dir, file );
		});
	},

	_findCreator: function ( filename ) {
		var i = this.inputs.length, node;
		while ( i-- ) {
			node = this.inputs[i];
			if ( node._findCreator( filename ) ) {
				return node;
			}
		}

		return null;
	}
});
