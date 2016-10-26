import Query from './shared/Query';
import { find } from '../../utils/array';

export default function Ractive$findAllComponents ( selector, options ) {
	if ( !options && typeof selector === 'object' ) {
		options = selector;
		selector = '';
	}

	options = options || {};

	let query = options._query;

	if ( !query ) {
		let liveQueries = this._liveComponentQueries;

		// Shortcut: if we're maintaining a live query with this
		// selector, we don't need to traverse the parallel DOM
		query = find( liveQueries, q => q.selector === selector && q.remote === options.remote );
		if ( query ) {
			if ( options.live ) query.refs++;
			// Either return the exact same query, or (if not live) a snapshot
			return ( options.live ) ? query : query.slice();
		}

		query = new Query( this, selector, !!options.live, true );
		options._query = query;
		query.remote = options.remote;

		// Add this to the list of live queries Ractive needs to maintain,
		// if applicable
		if ( query.live ) {
			liveQueries.push( query );
		}
	}

	this.fragment.findAllComponents( selector, query );

	if ( query.remote ) {
		// search non-fragment children
		this._children.forEach( c => {
			if ( !c.target && c.instance.fragment && c.instance.fragment.rendered ) {
				if ( query.test( c ) ) {
					query.add( c.instance );
					c.liveQueries.push( query );
				}

				c.instance.findAllComponents( selector, options );
			}
		});
	}

	query.init();
	return query.result;
}

