import runloop from '../../global/runloop';
import interpolate from '../../shared/interpolate';
import { isEqual } from '../../utils/is';
import { splitKeypath } from '../../shared/keypaths';
import easing from '../../Ractive/static/easing';
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
	if ( typeof keypath === 'object' ) {
		const keys = Object.keys( keypath );

		throw new Error( `ractive.animate(...) no longer supports objects. Instead of ractive.animate({
  ${keys.map( key => `'${key}': ${keypath[ key ]}` ).join( '\n  ' )}
}, {...}), do

${keys.map( key => `ractive.animate('${key}', ${keypath[ key ]}, {...});` ).join( '\n' )}
` );
	}

	options = getOptions( options, this );

	const model = this.viewmodel.joinAll( splitKeypath( keypath ) );
	const from = model.get();

	// don't bother animating values that stay the same
	if ( isEqual( from, to ) ) {
		options.complete( options.to );
		return noAnimation; // TODO should this have .then and .catch methods?
	}

	const interpolator = interpolate( from, to, this, options.interpolator );

	// if we can't interpolate the value, set it immediately
	if ( !interpolator ) {
		runloop.start();
		model.set( to );
		runloop.end();

		return noAnimation;
	}

	return model.animate( from, to, options, interpolator );
}
