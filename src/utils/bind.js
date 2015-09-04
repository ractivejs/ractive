export default function bind ( fn, context ) {
	if ( !/this/.test( fn.toString() ) ) return fn;

	let bound = fn.bind( context );
	for ( let prop in fn ) bound[ prop ] = fn[ prop ];

	return bound;
}
