import { fromExpression } from './createFunction';
import { isArray, isObject } from 'utils/is';
import { keys } from 'utils/object';

export default function insertExpressions ( obj, expr ) {
	keys( obj ).forEach( key => {
		if  ( isExpression( key, obj ) ) return addTo( obj, expr );

		const ref = obj[ key ];
		if ( hasChildren( ref ) ) insertExpressions( ref, expr );
	});
}

function isExpression( key, obj ) {
	return key === 's' && isArray( obj.r );
}

function addTo( obj, expr ) {
	const { s, r } = obj;
	if ( !expr[ s ] ) expr[ s ] = fromExpression( s, r.length );
}

function hasChildren( ref ) {
	return isArray( ref ) || isObject( ref );
}
