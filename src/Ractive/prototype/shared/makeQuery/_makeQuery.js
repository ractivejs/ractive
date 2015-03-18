import { defineProperties } from 'utils/object';
import test from './test';
import cancel from './cancel';
import sort from './sort';
import dirty from './dirty';
import remove from './remove';

export default function makeQuery ( ractive, selector, live, isComponentQuery ) {
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
}
