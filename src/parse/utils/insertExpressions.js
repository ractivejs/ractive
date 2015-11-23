import { isArray, isObject } from '../../utils/is';

export default function insertExpressions ( obj, expressions ) {
	Object.keys( obj ).forEach( key => {
		if ( key === 's' ) {
			expressions[ obj.s ] = createFunction( obj );
		} else if ( isArray( obj[ key ] ) || isObject( obj[ key ] ) ) {
			insertExpressions( obj[ key ], expressions );
		}
	});
}

function createFunction ( x ) {
	let i = x.r.length,
		args = new Array( i );

	while ( i-- ) {
		args[i] = `_${i}`;
	}

	// Functions created directly with new Function() look like this:
	//     function anonymous (_0 /**/) { return _0*2 }
	//
	// With this workaround, we get a little more compact:
	//     function (_0){return _0*2}
	return new Function( [], `return function(${args.join(',')}){return(${x.s})}` )();
}
