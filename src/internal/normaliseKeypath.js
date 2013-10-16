var normaliseKeypath;

(function () {

	var pattern = /\[\s*([0-9]|[1-9][0-9]+)\s*\]/g;

	normaliseKeypath = function ( keypath ) {
		return keypath.replace( pattern, '.$1' );
	};

}());
