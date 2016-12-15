export function fillGaps ( target, ...sources ) {

	for (let i = 0; i < sources.length; i++){
		const source = sources[i];
		for ( const key in source ) {
			if ( !source.hasOwnProperty(key) || key in target ) continue;
			target[ key ] = source[ key ];
		}
	}

	return target;
}

export function toPairs ( obj = {} ) {
	const pairs = [];
	for ( const key in obj ) {
		if ( !obj.hasOwnProperty( key ) ) continue;
		pairs.push( [ key, obj[ key ] ] );
	}
	return pairs;
}
