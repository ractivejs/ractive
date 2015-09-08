import runloop from '../../global/runloop';
import interpolate from '../../shared/interpolate';
import animations from '../../shared/animations';
import { isEqual } from '../../utils/is';
import { splitKeypath } from '../../shared/keypaths';
import easing from '../../Ractive/static/easing';
import Ticker from '../../shared/Ticker';
import Promise from '../../utils/Promise';
import noop from '../../utils/noop';

const noAnimation = { stop: noop };
const linear = easing.linear;

function getOptions ( options, instance ) {
	options = options || {};

	let easing;
	if ( options.easing ) {
		easing = typeof options.easing === 'function' ?
			options.easing :
			instance.easing[ options.easing ];
	}

	return {
		easing: easing || linear,
		duration: 'duration' in options ? options.duration : 400,
		complete: options.complete || noop,
		step: options.step || noop
	};
}

export default function Ractive$animate ( keypath, to, options ) {
	let fulfilPromise;
	const promise = new Promise( fulfil => fulfilPromise = fulfil );

	const animation = typeof keypath === 'object' ?
		animateMultiple( this, keypath, getOptions( to ), fulfilPromise ) :
		animate( this, keypath, to, getOptions( options ), fulfilPromise );

	promise.stop = () => animation.stop();
	return promise;
}

function animateMultiple ( root, map, options, callback ) {
	let animations = [];
	let finalValues = {};

	let immediateChanges = [];
	let hasImmediateChanges;

	Object.keys( map ).forEach( keypath => {
		const model = root.viewmodel.joinAll( splitKeypath( keypath ) );
		const from = model.get();
		const to = map[ keypath ];

		finalValues[ keypath ] = to;

		if ( isEqual( from, to ) ) return;

		const interpolator = interpolate( from, to, root, options.interpolator );

		if ( interpolator ) {
			animations.push({ keypath, model, to, interpolator });
		} else {
			immediateChanges.push({ model, to });
			hasImmediateChanges = true;
		}
	});

	if ( hasImmediateChanges ) {
		runloop.start();
		immediateChanges.forEach( ({ model, to }) => model.set( to ) );
		runloop.end();
	}

	let currentValues = {};

	if ( animations.length ) {
		const ticker = new Ticker({
			duration: options.duration,
			easing: options.easing,
			step ( t ) {
				animations.forEach( ({ keypath, model, interpolator }) => {
					const value = interpolator( t );
					currentValues[ keypath ] = value;

					model.set( value );
				});

				options.step( t, currentValues );
			},
			complete () {
				animations.forEach( ({ model, to }) => {
					model.set( to );
				});

				options.complete( finalValues );

				callback();
			}
		});

		return ticker;
	}

	callback();
	return noAnimation;
}

function animate ( root, keypath, to, options, callback ) {
	const model = root.viewmodel.joinAll( splitKeypath( keypath ) );
	const from = model.get();

	// cancel any existing animation
	// TODO what about upstream/downstream keypaths?
	animations.abort( model, root );

	// don't bother animating values that stay the same
	if ( isEqual( from, to ) ) {
		options.complete( options.to );
		return noAnimation; // TODO should this have .then and .catch methods?
	}

	const interpolator = interpolate( from, to, root, options.interpolator );

	// if we can't interpolate the value, set it immediately
	if ( !interpolator ) {
		runloop.start();
		model.set( to );
		runloop.end();

		return noAnimation;
	}

	const ticker = new Ticker({
		duration: options.duration,
		easing: options.easing,
		step ( t ) {
			const value = interpolator( t );
			model.set( value );
			if ( options.step ) options.step( t, value );
		},
		complete () {
			model.set( to );
			if ( options.complete ) options.complete( to );

			callback();
		}
	});

	//root._animations.push( ticker );
	return ticker;
}
