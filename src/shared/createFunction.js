let functionCache = {};

export default function createFunction ( str, i ) {
	if ( functionCache[ str ] ) return functionCache[ str ];

	let args = new Array( i );
	while ( i-- ) args[i] = `_${i}`;

	const fn = new Function( args.join( ',' ), `return (${str})` );

	return ( functionCache[ str ] = fn );
}
