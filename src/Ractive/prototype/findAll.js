import Query from './shared/Query';
import { find } from '../../utils/array';

export default function Ractive$findAll ( selector, options = {} ) {
	if ( !this.el ) throw new Error( `Cannot call ractive.findAll('${selector}', ...) unless instance is rendered to the DOM` );

	let query = options._query;

	if ( !query ) {
		let liveQueries = this._liveQueries;

		// Shortcut: if we're maintaining a live query with this
		// selector, we don't need to traverse the parallel DOM
		query = find( liveQueries, q => q.selector === selector && q.remote === options.remote );
		if ( query ) {
			if ( options.live ) query.refs++;
			// Either return the exact same query, or (if not live) a snapshot
			return options.live ? query : query.slice();
		}

		query = new Query( this, selector, !!options.live, false );
		options._query = query;
		query.remote = options.remote;

		// Add this to the list of live queries Ractive needs to maintain,
		// if applicable
		if ( query.live ) {
			liveQueries.push( query );
		}
	}

	this.fragment.findAll( selector, query );

	if ( query.remote ) {
		// seach non-fragment children
		this._children.forEach( c => {
			if ( !c.target && c.instance.fragment && c.instance.fragment.rendered ) {
				c.instance.findAll( selector, options );
			}
		});
	}

	query.init();
	return query.result;
}
