define([
	'utils/isEqual',
	'Ractive/prototype/animate/animations',
	'Ractive/prototype/animate/Animation',
	'registries/easing'
],

function (
	isEqual,
	animations,
	Animation,
	easingRegistry
) {

	'use strict';

	var noAnimation = {
		stop: function () {}
	};


	return function ( keypath, to, options ) {

		var k,
			animation,
			animations,
			easing,
			duration,
			step,
			complete,
			makeValueCollector,
			currentValues,
			collectValue,
			dummy,
			dummyOptions;

		// animate multiple keypaths
		if ( typeof keypath === 'object' ) {
			options = to || {};
			easing = options.easing;
			duration = options.duration;

			animations = [];

			// we don't want to pass the `step` and `complete` handlers, as they will
			// run for each animation! So instead we'll store the handlers and create
			// our own...
			step = options.step;
			complete = options.complete;

			if ( step || complete ) {
				currentValues = {};

				options.step = null;
				options.complete = null;

				makeValueCollector = function ( keypath ) {
					return function ( t, value ) {
						currentValues[ keypath ] = value;
					};
				};
			}


			for ( k in keypath ) {
				if ( keypath.hasOwnProperty( k ) ) {
					if ( step || complete ) {
						collectValue = makeValueCollector( k );
						options = {
							easing: easing,
							duration: duration
						};

						if ( step ) {
							options.step = collectValue;
						}

						if ( complete ) {
							options.complete = collectValue;
						}
					}

					animations[ animations.length ] = animate( this, k, keypath[k], options );
				}
			}

			if ( step || complete ) {
				dummyOptions = {
					easing: easing,
					duration: duration
				};

				if ( step ) {
					dummyOptions.step = function ( t ) {
						step( t, currentValues );
					};
				}

				if ( complete ) {
					dummyOptions.complete = function ( t ) {
						complete( t, currentValues );
					};
				}

				animations[ animations.length ] = dummy = animate( this, null, null, dummyOptions );
			}

			return {
				stop: function () {
					while ( animations.length ) {
						animations.pop().stop();
					}

					if ( dummy ) {
						dummy.stop();
					}
				}
			};
		}

		// animate a single keypath
		options = options || {};

		animation = animate( this, keypath, to, options );

		return {
			stop: function () {
				animation.stop();
			}
		};
	};

	function animate ( root, keypath, to, options ) {
		var easing, duration, animation, from;

		if ( keypath !== null ) {
			from = root.get( keypath );
		}

		// cancel any existing animation
		// TODO what about upstream/downstream keypaths?
		animations.abort( keypath, root );

		// don't bother animating values that stay the same
		if ( isEqual( from, to ) ) {
			if ( options.complete ) {
				options.complete( 1, options.to );
			}

			return noAnimation;
		}

		// easing function
		if ( options.easing ) {
			if ( typeof options.easing === 'function' ) {
				easing = options.easing;
			}

			else {
				if ( root.easing && root.easing[ options.easing ] ) {
					// use instance easing function first
					easing = root.easing[ options.easing ];
				} else {
					// fallback to global easing functions
					easing = easingRegistry[ options.easing ];
				}
			}

			if ( typeof easing !== 'function' ) {
				easing = null;
			}
		}

		// duration
		duration = ( options.duration === undefined ? 400 : options.duration );

		// TODO store keys, use an internal set method
		animation = new Animation({
			keypath: keypath,
			from: from,
			to: to,
			root: root,
			duration: duration,
			easing: easing,

			// TODO wrap callbacks if necessary, to use instance as context
			step: options.step,
			complete: options.complete
		});

		animations.add( animation );
		root._animations[ root._animations.length ] = animation;

		return animation;
	}

});