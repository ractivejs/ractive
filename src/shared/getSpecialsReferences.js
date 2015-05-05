import getContextStack from './getContextStack';

export default function getSpecialsReferences ( fragment ) {
	const result = { index: {}, key: {} },
		  index = result.index, key = result.key,
		  stack = getContextStack( fragment );

	var context, special;

	// pseudo generator iterator
	for ( var _iterator = stack/*[Symbol.iterator]*/(), _step; !(_step = _iterator.next()).done; ) {
		context = _step.value;

		if( context.specials ) {
			if ( special = context.specials[ '@index' ] ) {
				index[ special ] = context.join( '@index' ).get();
			}
			if ( special = context.specials[ '@key' ] ) {
				key[ special ] = context.join( '@key' ).get();
			}
		}
	}

	return result;
}
