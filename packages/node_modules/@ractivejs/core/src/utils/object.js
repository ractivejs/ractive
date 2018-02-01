export function fillGaps ( target, ...sources ) {

	for (let i = 0; i < sources.length; i++){
		const source = sources[i];
		for ( const key in source ) {
			// Source can be a prototype-less object.
			if ( key in target || !Object.prototype.hasOwnProperty.call( source, key ) ) continue;
			target[ key ] = source[ key ];
		}
	}

	return target;
}

export function toPairs ( obj = {} ) {
	const pairs = [];
	for ( const key in obj ) {
		// Source can be a prototype-less object.
		if ( !Object.prototype.hasOwnProperty.call( obj, key ) ) continue;
		pairs.push( [ key, obj[ key ] ] );
	}
	return pairs;
}
