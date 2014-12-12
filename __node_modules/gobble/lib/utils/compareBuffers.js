module.exports = function compareBuffers ( a, b ) {
	var i = a.length;

	if ( b.length !== i ) {
		return false;
	}

	while ( i-- ) {
		if ( a[i] !== b[i] ) {
			return false;
		}
	}

	return true;
};
