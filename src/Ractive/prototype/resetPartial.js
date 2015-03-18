import { isArray } from 'utils/is';
import runloop from 'global/runloop';
import { PARTIAL, COMPONENT, ELEMENT } from 'config/types';

export default function ( name, partial ) {
	var promise, collection = [];

	function collect( source, dest, ractive ) {
		// if this is a component and it has its own partial, bail
		if ( ractive && ractive.partials[name] ) return;

		source.forEach( item => {
			// queue to rerender if the item is a partial and the current name matches
			if ( item.type === PARTIAL && item.getPartialName() === name ) {
				dest.push( item );
			}

			// if it has a fragment, process its items
			if ( item.fragment ) {
				collect( item.fragment.items, dest, ractive );
			}

			// or if it has fragments
			if ( isArray( item.fragments ) ) {
				collect( item.fragments, dest, ractive );
			}

			// or if it is itself a fragment, process its items
			else if ( isArray( item.items ) ) {
				collect( item.items, dest, ractive );
			}

			// or if it is a component, step in and process its items
			else if ( item.type === COMPONENT && item.instance ) {
				collect( item.instance.fragment.items, dest, item.instance );
			}

			// if the item is an element, process its attributes too
			if ( item.type === ELEMENT ) {
				if ( isArray( item.attributes ) ) {
					collect( item.attributes, dest, ractive );
				}

				if ( isArray( item.conditionalAttributes ) ) {
					collect( item.conditionalAttributes, dest, ractive );
				}
			}
		});
	}

	collect( this.fragment.items, collection );
	this.partials[name] = partial;

	promise = runloop.start( this, true );

	collection.forEach( item => {
		item.value = undefined;
		item.setValue( name );
	});

	runloop.end();

	return promise;
}
