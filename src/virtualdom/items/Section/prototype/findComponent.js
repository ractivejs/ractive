export default function Section$findComponent ( selector ) {
	var i, len, queryResult;

	len = this.fragments.length;
	for ( i = 0; i < len; i += 1 ) {
		if ( queryResult = this.fragments[i].findComponent( selector ) ) {
			return queryResult;
		}
	}

	return null;
}
