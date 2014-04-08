define([
	'render/shared/utils/startsWithKeypath'
], function (
	startsWithKeypath
) {

	'use strict';

	return function startsWith( target, keypath) {
		return target === keypath || startsWithKeypath(target, keypath);
	};

});
