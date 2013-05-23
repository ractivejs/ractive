// thanks, http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
utils.isArray = function ( obj ) {
	return Object.prototype.toString.call( obj ) === '[object Array]';
};