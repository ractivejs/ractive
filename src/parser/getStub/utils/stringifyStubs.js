var stringifyStubs = function ( items ) {
	var str = '', itemStr, i, len;

	if ( !items ) {
		return '';
	}

	for ( i=0, len=items.length; i<len; i+=1 ) {
		itemStr = items[i].toString();
		
		if ( itemStr === false ) {
			return false;
		}

		str += itemStr;
	}

	return str;
};