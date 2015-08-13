import { TEXT } from 'config/types';

// TODO all this code needs to die
export default function processItems ( items, values, guid, counter = 0 ) {
	return items.map( function ( item ) {
		if ( item.type === TEXT ) {
			return item.template;
		}

		if ( item.fragment ) {
			if ( item.fragment.iterations ) {
				return item.fragment.iterations.map( fragment => {
					return processItems( fragment.items, values, guid, counter );
				}).join( '' );
			} else {
				return processItems( item.fragment.items, values, guid, counter );
			}
		}

		const placeholderId = `${guid}-${counter++}`;

		values[ placeholderId ] = item.model ?
			item.model.wrapper ?
				item.model.wrapper.value :
				item.model.get() :
			undefined;

		return '${' + placeholderId + '}';
	}).join( '' );
}
