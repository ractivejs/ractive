import { fatal } from '../utils/log';
import { missingPlugin } from '../config/errors';
import interpolators from '../Ractive/static/interpolators';
import { findInViewHierarchy } from './registry';

export default function interpolate ( from, to, ractive, type ) {
	if ( from === to ) return null;

	if ( type ) {
		const interpol = findInViewHierarchy( 'interpolators', ractive, type );
		if ( interpol ) return interpol( from, to ) || null;

		fatal( missingPlugin( type, 'interpolator' ) );
	}

	return interpolators.number( from, to ) ||
	       interpolators.array( from, to ) ||
	       interpolators.object( from, to ) ||
	       null;
}
