// TODO give this a less conflicty name
var fail = function ( tokenizer, expected ) {
	var remaining = tokenizer.remaining().substr( 0, 40 );
	if ( remaining.length === 40 ) {
		remaining += '...';
	}
	throw new Error( 'Tokenizer failed: unexpected string "' + remaining + '" (expected ' + expected + ')' );
};