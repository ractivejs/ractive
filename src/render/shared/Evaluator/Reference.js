import types from 'config/types';
import isEqual from 'utils/isEqual';
import defineProperty from 'utils/defineProperty';
import registerDependant from 'shared/registerDependant';
import unregisterDependant from 'shared/unregisterDependant';

var Reference, thisPattern;
thisPattern = /this/;

Reference = function ( root, keypath, evaluator, argNum, priority ) {
    var value;

    this.evaluator = evaluator;
    this.keypath = keypath;
    this.root = root;
    this.argNum = argNum;
    this.type = types.REFERENCE;
    this.priority = priority;

    value = root.get( keypath );

    if ( typeof value === 'function' && !value._nowrap ) {
        value = wrapFunction( value, root, evaluator );
    }

    this.value = evaluator.values[ argNum ] = value;

    registerDependant( this );
};

Reference.prototype = {
    update: function () {
        var value = this.root.get( this.keypath );

        if ( typeof value === 'function' && !value._nowrap ) {
            value = wrapFunction( value, this.root, this.evaluator );
        }

        if ( !isEqual( value, this.value ) ) {
            this.evaluator.values[ this.argNum ] = value;
            this.evaluator.bubble();

            this.value = value;
        }
    },

    teardown: function () {
        unregisterDependant( this );
    }
};

export default Reference;

function wrapFunction ( fn, ractive, evaluator ) {
    var prop, evaluators, index;

    // If the function doesn't refer to `this`, we don't need
    // to set the context, because we're not doing `this.get()`
    // (which is how dependencies are tracked)
    if ( !thisPattern.test( fn.toString() ) ) {
        defineProperty( fn, '_nowrap', { // no point doing this every time
            value: true
        });
        return fn;
    }

    // If this function is being wrapped for the first time...
    if ( !fn[ '_' + ractive._guid ] ) {
        // ...we need to do some work
        defineProperty( fn, '_' + ractive._guid, {
            value: function () {
                var originalCaptured, result, i, evaluator;

                originalCaptured = ractive._captured;

                if ( !originalCaptured ) {
                    ractive._captured = [];
                }

                result = fn.apply( ractive, arguments );

                if ( ractive._captured.length ) {
                    i = evaluators.length;
                    while ( i-- ) {
                        evaluator = evaluators[i];
                        evaluator.updateSoftDependencies( ractive._captured );
                    }
                }

                // reset
                ractive._captured = originalCaptured;

                return result;
            },
            writable: true
        });

        for ( prop in fn ) {
            if ( fn.hasOwnProperty( prop ) ) {
                fn[ '_' + ractive._guid ][ prop ] = fn[ prop ];
            }
        }

        fn[ '_' + ractive._guid + '_evaluators' ] = [];
    }

    // We need to make a note of which evaluators are using this function,
    // so that they can all be notified of changes
    evaluators = fn[ '_' + ractive._guid + '_evaluators' ];

    index = evaluators.indexOf( evaluator );
    if ( index === -1 ) {
        evaluators.push( evaluator );
    }

    // Return the wrapped function
    return fn[ '_' + ractive._guid ];
}
