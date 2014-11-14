import types from 'config/types';
import isArray from 'utils/isArray';

export default process;

function process( path, target, items ) {
	let i = items.length, item, cmp;

	while ( i-- ) {
		item = items[i];

		if ( isPartial( item ) ) {
			target[ item.n ] = item.f;
			items.splice( i, 1 );
		} else if ( isArray( item.f ) ) {
			if ( cmp = getComponent( path, item ) ) {
				path.push( cmp );
				process( path, item.p = {}, item.f );
				path.pop();
			} else if ( isArray( item.f ) ) {
				process( path, target, item.f );
			}
		}
	}
}

function isPartial( item ) {
	return item.t === types.INLINE_PARTIAL;
}

function getComponent( path, item ) {
	var i, cmp, name = item.e;

	if ( item.e ) {
		for ( i = 0; i < path.length; i++ ) {
			if ( cmp = ( path[i].components || {} )[name] ) {
				return cmp;
			}
		}
	}
}
