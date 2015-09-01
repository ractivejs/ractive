let functionCache = {};

export default function createFunction ( str, i, additional ) {
	if ( functionCache[ str ] ) return functionCache[ str ];

	let args = new Array( i );
	if ( additional ) args[ i ] = additional;
	while ( i-- ) args[i] = `_${i}`;

	const fn = new Function( args.join( ',' ), `return (${str})` );

	return ( functionCache[ str ] = fn );
}
