module.exports = function assign ( target ) {
	Array.prototype.slice.call( arguments, 1 ).forEach( function ( source ) {
		var key;

		for ( key in source ) {
			if ( source.hasOwnProperty( key ) ) {
				target[ key ] = source[ key ];
			}
		}
	});

	return target;
};
