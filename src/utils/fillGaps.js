export default function ( target, ...sources ) {
	sources.forEach( s => {
		for ( let key in s ) {
			if ( s.hasOwnProperty( key ) && !( key in target ) ) {
				target[ key ] = s[ key ];
			}
		}
	});

	return target;
}
