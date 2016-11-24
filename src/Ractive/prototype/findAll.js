import { getQuery } from './shared/Query';

export default function Ractive$findAll ( selector, options = {} ) {
	if ( !this.el ) throw new Error( `Cannot call ractive.findAll('${selector}', ...) unless instance is rendered to the DOM` );

	let query = options._query;

	if ( !query ) {
		query = getQuery( this, selector, options, false );
		if ( query.old ) return query.old;
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
