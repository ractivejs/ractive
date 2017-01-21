import { fromExpression } from './createFunction';
import { isObject } from '../../utils/is';

export default function insertExpressions ( obj, expr ) {

	Object.keys( obj ).forEach( key => {
		if  ( isExpression( key, obj ) ) return addTo( obj, expr );

		const ref = obj[ key ];
		if ( hasChildren( ref ) ) insertExpressions( ref, expr );
	});
}

function isExpression( key, obj ) {
	return key === 's' && Array.isArray( obj.r );
}

function addTo( obj, expr ) {
	const { s, r } = obj;
	if ( !expr[ s ] ) expr[ s ] = fromExpression( s, r.length );
}

function hasChildren( ref ) {
	return Array.isArray( ref ) || isObject( ref );
}
