define(function () {

	'use strict';
	
	var sets = {};
	
	return function getSiblings ( id, group, keypath ) {
		var hash = id + group + keypath;
		return sets[ hash ] || ( sets[ hash ] = [] );
	};

});