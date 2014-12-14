import warn from 'utils/log/warn';
import interpolators from 'Ractive/static/interpolators';
import { findInViewHierarchy } from 'shared/registry';

var interpolate = function ( from, to, ractive, type ) {
	if ( from === to ) {
		return snap( to );
	}

	if ( type ) {

		let interpol = findInViewHierarchy( 'interpolators', ractive, type );
		if ( interpol ) {
			return interpol( from, to ) || snap( to );
		}

		warn( 'Missing "' + type + '" interpolator. You may need to download a plugin from [TODO]' );
	}

	return interpolators.number( from, to ) ||
	       interpolators.array( from, to ) ||
	       interpolators.object( from, to ) ||
	       snap( to );
};

export default interpolate;

function snap ( to ) {
	return () => to;
}
