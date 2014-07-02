export default function Fragment$find ( selector ) {
	var i, len, item, queryResult;

	if ( this.items ) {
		len = this.items.length;
		for ( i = 0; i < len; i += 1 ) {
			item = this.items[i];

			if ( item.find && ( queryResult = item.find( selector ) ) ) {
				return queryResult;
			}
		}

		return null;
	}
}
