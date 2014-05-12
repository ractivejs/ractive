export default function Fragment$findAllComponents ( selector, query ) {
	var i, len, item;

	if ( this.items ) {
		len = this.items.length;
		for ( i = 0; i < len; i += 1 ) {
			item = this.items[i];

			if ( item.findAllComponents ) {
				item.findAllComponents( selector, query );
			}
		}
	}

	return query;
}
