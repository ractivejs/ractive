export default function () {
	var liveQueries, selector, index;

	liveQueries = this._root[ this._isComponentQuery ? 'liveComponentQueries' : 'liveQueries' ];
	selector = this.selector;

	index = liveQueries.indexOf( selector );

	if ( index !== -1 ) {
		liveQueries.splice( index, 1 );
		liveQueries[ selector ] = null;
	}
}
