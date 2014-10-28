import runloop from 'global/runloop';
import types from 'config/types';
import isArray from 'utils/isArray';

export default function( name, partial, callback ) {
	var promise, collection = [];

	function collect( source, dest, ractive ) {
		// if this is a component and it has its own partial, bail
		if ( ractive && ractive.partials[name] ) return;

		for ( let item of source ) {
			// queue to rerender if the item is a partial and the current name matches
			if ( item.type === types.PARTIAL && item.getPartialName() === name ) {
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
			else if ( item.type === types.COMPONENT && item.instance ) {
				collect( item.instance.fragment.items, dest, item.instance );
			}
		}
	}

	collect( this.fragment.items, collection );
	this.partials[name] = partial;

	promise = runloop.start( this, true );

	// force each item to rerender
	for ( let item of collection ) {
		item.value = undefined;
		item.setValue( name );
	}

	runloop.end();

	if ( callback ) {
		promise.then( callback.bind( this ) );
	}

	return promise;
}
