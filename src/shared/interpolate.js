import warn from 'utils/log/warn';
import interpolators from 'Ractive/interpolators';
import config from 'Ractive/config/config';

var interpolate = function ( from, to, ractive, type ) {
	if ( from === to ) {
		return snap( to );
	}

	if ( type ) {

		let interpol = config.registries.interpolators.find( ractive, type );
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
