export default function Fragment$detach () {
	var docFrag;

	if ( this.items.length === 1 ) {
		return this.items[0].detach();
	}

	docFrag = document.createDocumentFragment();

	this.items.forEach( item => {
		var node = item.detach();

		// TODO The if {...} wasn't previously required - it is now, because we're
		// forcibly detaching everything to reorder sections after an update. That's
		// a non-ideal brute force approach, implemented to get all the tests to pass
		// - as soon as it's replaced with something more elegant, this should
		// revert to `docFrag.appendChild( item.detach() )`
		if ( node ) {
			docFrag.appendChild( node );
		}
	});

	return docFrag;
}
