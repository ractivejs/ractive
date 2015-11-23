import createFunction from './createFunction';
import { isArray, isObject } from '../../utils/is';

export default function insertExpressions ( obj, expressions ) {
	if ( !obj ) return;

	if ( isArray( obj ) ) {
		obj.forEach( each => {
			expressions = insertExpressions( each, expressions );
		});
	}
	else if ( isObject( obj ) ) {
		Object.keys( obj ).forEach( key => {
			let ref = obj[ key ];
			if ( key === 'x' ) {
				// look out for double-nexted .x, ie. {{#with 3 * 2 + 10 as num}}{{num}}{{/with}}
				if ( ref.x ) ref = ref.x;

				const { s, r } = ref;
				if ( !expressions ) expressions = {};
				if ( !expressions[ s ] ) {
					expressions[ s ] = createFunction( s, r.length );
				}

			}
			else if ( key === 'a' ) {
				// don't iterate attributes, ie. <svg x='100'>
				Object.keys( ref ).forEach( key => {
					expressions = insertExpressions( ref[key], expressions );
				});

			}
			else {
				expressions = insertExpressions( ref, expressions );
			}
		});
	}

	return expressions;
}

