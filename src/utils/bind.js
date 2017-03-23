const fnBind = Function.prototype.bind;

export default function bind ( fn, context ) {
	if ( !/this/.test( fn.toString() ) ) return fn;

	const bound = fnBind.call( fn, context );
	for ( const prop in fn ) bound[ prop ] = fn[ prop ];

	return bound;
}
