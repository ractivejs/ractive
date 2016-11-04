export default function bind ( fn, context ) {
	if ( !/this/.test( fn.toString() ) ) return fn;

	const bound = fn.bind( context );
	for ( const prop in fn ) bound[ prop ] = fn[ prop ];

	return bound;
}
