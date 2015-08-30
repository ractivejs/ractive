import { isArray } from '../../utils/is';
import runloop from '../../global/runloop';
import { PARTIAL, COMPONENT, ELEMENT } from '../../config/types';

function collect( source, name, dest ) {
	source.forEach( item => {
		// queue to rerender if the item is a partial and the current name matches
		if ( item.type === PARTIAL && item.name === name ) {
			dest.push( item );
			return; // go no further
		}

		// if it has a fragment, process its items
		if ( item.fragment ) {
			collect( item.fragment.iterations || item.fragment.items, name, dest );
		}

		// or if it is itself a fragment, process its items
		else if ( isArray( item.items ) ) {
			collect( item.items, name, dest );
		}

		// or if it is a component, step in and process its items
		else if ( item.type === COMPONENT && item.instance ) {
			// ...unless the partial is shadowed
			if ( item.instance.partials[ name ] ) return;
			collect( item.instance.fragment.items, name, dest );
		}

		// if the item is an element, process its attributes too
		if ( item.type === ELEMENT ) {
			if ( isArray( item.attributes ) ) {
				collect( item.attributes, name, dest );
			}

			if ( isArray( item.conditionalAttributes ) ) {
				collect( item.conditionalAttributes, name, dest );
			}
		}
	});
}

function forceResetTemplate ( partial ) {
	partial.forceResetTemplate();
}

export default function ( name, partial ) {
	let collection = [];
	collect( this.fragment.items, name, collection );

	const promise = runloop.start( this, true );

	this.partials[ name ] = partial;
	collection.forEach( forceResetTemplate );

	runloop.end();

	return promise;
}
