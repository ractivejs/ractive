import { message } from '../utils/log';
import interpolators from '../Ractive/static/interpolators';
import { findInViewHierarchy } from './registry';

export default function interpolate ( from, to, ractive, type ) {
	if ( from === to ) return null;

	if ( type ) {
		let interpol = findInViewHierarchy( 'interpolators', ractive, type );
		if ( interpol ) return interpol( from, to ) || null;

		message( 'MISSING_PLUGIN', type, 'interpolator' );
	}

	return interpolators.number( from, to ) ||
	       interpolators.array( from, to ) ||
	       interpolators.object( from, to ) ||
	       null;
}
