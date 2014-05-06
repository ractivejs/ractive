import defineProperties from 'utils/defineProperties';
import test from 'Ractive/prototype/shared/makeQuery/test';
import cancel from 'Ractive/prototype/shared/makeQuery/cancel';
import sort from 'Ractive/prototype/shared/makeQuery/sort';
import dirty from 'Ractive/prototype/shared/makeQuery/dirty';
import remove from 'Ractive/prototype/shared/makeQuery/remove';

export default function ( ractive, selector, live, isComponentQuery ) {
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
