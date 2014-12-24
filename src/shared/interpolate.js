import { warnOnce } from 'utils/log';
import { missingPlugin } from 'config/errors';
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

		warnOnce( missingPlugin( type, 'interpolator' ) );
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
