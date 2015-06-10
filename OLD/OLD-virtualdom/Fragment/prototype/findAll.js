export default function Fragment$findAll ( selector, query ) {
	var i, len, item;

	if ( this.items ) {
		len = this.items.length;
		for ( i = 0; i < len; i += 1 ) {
			item = this.items[i];

			if ( item.findAll ) {
				item.findAll( selector, query );
			}
		}
	}

	return query;
}
