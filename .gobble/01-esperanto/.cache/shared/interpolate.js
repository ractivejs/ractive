define(['circular','utils/warn','config/defaults/interpolators','config/config'],function (circular, warn, interpolators, config) {

	'use strict';
	
	var __export;
	
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
	
	circular.interpolate = interpolate;
	__export = interpolate;
	
	function snap ( to ) {
		return () => to;
	}
	return __export;

});