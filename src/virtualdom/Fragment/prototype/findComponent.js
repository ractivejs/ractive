export default function Fragment$findComponent ( selector, options ) {
	var len, i, item, queryResult;

	if ( this.items ) {
		len = this.items.length;
		for ( i = 0; i < len; i += 1 ) {
			item = this.items[i];

			if ( item.findComponent && ( queryResult = item.findComponent( selector, options ) ) ) {
				return queryResult;
			}
		}

		return null;
	}
}
