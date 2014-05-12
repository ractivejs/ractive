export default function Section$find ( selector ) {
	var i, len, queryResult;

	len = this.fragments.length;
	for ( i = 0; i < len; i += 1 ) {
		if ( queryResult = this.fragments[i].find( selector ) ) {
			return queryResult;
		}
	}

	return null;
}
