import animations from 'shared/animations';
import Animation from './animate/Animation';
import { isEqual } from 'utils/is';
import { normalise } from 'shared/keypaths';
import Promise from 'utils/Promise';
import noop from 'utils/noop';

var noAnimation = { stop: noop };

export default function Ractive$animate ( keypath, to, options ) {
	var promise,
		fulfilPromise,
		k,
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

	promise = new Promise( fulfil => fulfilPromise = fulfil );

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
					options = { easing, duration };

					if ( step ) {
						options.step = collectValue;
					}
				}

				options.complete = complete ? collectValue : noop;
				animations.push( animate( this, k, keypath[k], options ) );
			}
		}

		// Create a dummy animation, to facilitate step/complete
		// callbacks, and Promise fulfilment
		dummyOptions = { easing, duration };

		if ( step ) {
			dummyOptions.step = t => step( t, currentValues );
		}

		if ( complete ) {
			promise.then( t => complete( t, currentValues ) );
		}

		dummyOptions.complete = fulfilPromise;

		dummy = animate( this, null, null, dummyOptions );
		animations.push( dummy );

		promise.stop = () => {
			var animation;

			while ( animation = animations.pop() ) {
				animation.stop();
			}

			if ( dummy ) {
				dummy.stop();
			}
		};

		return promise;
	}

	// animate a single keypath
	options = options || {};

	if ( options.complete ) {
		promise.then( options.complete );
	}

	options.complete = fulfilPromise;
	animation = animate( this, keypath, to, options );

	promise.stop = () => animation.stop();
	return promise;
}

function animate ( root, keypath, to, options ) {
	var context, easing, duration, animation, from;

	if ( keypath ) {
		// TODO revisit 'dummy' approach to handling multiple
		// animations? this seems kind of hokey
		context = root.viewmodel.getContext( keypath );
		from = root.viewmodel.get( context );

		// cancel any existing animation
		// TODO what about upstream/downstream keypaths?
		animations.abort( context, root );
	}

	// don't bother animating values that stay the same
	if ( isEqual( from, to ) ) {
		if ( options.complete ) {
			options.complete( options.to );
		}

		return noAnimation;
	}

	// easing function
	if ( options.easing ) {
		if ( typeof options.easing === 'function' ) {
			easing = options.easing;
		}

		else {
			easing = root.easing[ options.easing ];
		}

		if ( typeof easing !== 'function' ) {
			easing = null;
		}
	}

	// duration
	duration = ( options.duration === undefined ? 400 : options.duration );

	// TODO store keys, use an internal set method
	animation = new Animation({
		context,
		from,
		to,
		root,
		duration,
		easing,
		interpolator: options.interpolator,

		// TODO wrap callbacks if necessary, to use instance as context
		step: options.step,
		complete: options.complete
	});

	animations.add( animation );
	root._animations.push( animation );

	return animation;
}
