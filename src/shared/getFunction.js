export let functions = {};

export default function getFunction ( str, i ) {
	if ( functions[ str ] ) return functions[ str ];

	let args = new Array( i );
	while ( i-- ) args[i] = `_${i}`;

	return ( functions[ str ] = new Function( args.join( ',' ), `return (${str})` ) );
}
