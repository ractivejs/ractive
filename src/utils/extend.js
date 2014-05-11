export default function ( target, ...sources ) {
	var prop, source;

	while ( source = sources.shift() ) {
		for ( prop in source ) {
			if ( source.hasOwnProperty ( prop ) ) {
				target[ prop ] = source[ prop ];
			}
		}
	}

	return target;
}
