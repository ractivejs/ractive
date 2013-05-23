// http://stackoverflow.com/questions/18082/validate-numbers-in-javascript-isnumeric
utils.isNumeric = function ( n ) {
	return !isNaN( parseFloat( n ) ) && isFinite( n );
};