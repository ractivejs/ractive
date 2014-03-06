define([
	'utils/defineProperties',
	'Ractive/prototype/shared/makeQuery/test',
	'Ractive/prototype/shared/makeQuery/cancel',
	'Ractive/prototype/shared/makeQuery/sort',
	'Ractive/prototype/shared/makeQuery/dirty',
	'Ractive/prototype/shared/makeQuery/remove'
], function (
	defineProperties,
	test,
	cancel,
	sort,
	dirty,
	remove
) {

	'use strict';

	return function ( ractive, selector, live, isComponentQuery ) {
		var query = [];

		defineProperties( query, {
			selector: { value: selector },
			live: { value: live },

			_isComponentQuery: { value: isComponentQuery },
			_test: { value: test }
		});

		if ( !live ) {
			return query;
		}

		defineProperties( query, {
			cancel: { value: cancel },

			_root: { value: ractive },
			_sort: { value: sort },
			_makeDirty: { value: dirty },
			_remove: { value: remove },

			_dirty: { value: false, writable: true }
		});

		return query;
	};

});
