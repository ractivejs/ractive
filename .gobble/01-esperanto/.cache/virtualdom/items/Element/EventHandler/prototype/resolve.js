define(function () {

	'use strict';
	
	return function EventHandler$resolve ( index, keypath ) {
		this.args[ index ] = {
			keypath: keypath
		};
	};

});