import runloop from 'global/runloop';
import isEqual from 'utils/isEqual';
import get from 'shared/get/_get';

var Observer = function ( ractive, keypath, callback, options ) {
    var self = this;

    this.root = ractive;
    this.keypath = keypath;
    this.callback = callback;
    this.defer = options.defer;
    this.debug = options.debug;

    this.proxy = {
        update: function () {
            self.reallyUpdate();
        }
    };

    // Observers are notified before any DOM changes take place (though
    // they can defer execution until afterwards)
    this.priority = 0;

    // default to root as context, but allow it to be overridden
    this.context = ( options && options.context ? options.context : ractive );
};

Observer.prototype = {
    init: function ( immediate ) {
        if ( immediate !== false ) {
            this.update();
        } else {
            this.value = get( this.root, this.keypath );
        }
    },

    update: function () {
        if ( this.defer && this.ready ) {
            runloop.addObserver( this.proxy );
            return;
        }

        this.reallyUpdate();
    },

    reallyUpdate: function () {
        var oldValue, newValue;

        oldValue = this.value;
        newValue = get( this.root, this.keypath );

        this.value = newValue;

        // Prevent infinite loops
        if ( this.updating ) {
            return;
        }

        this.updating = true;

        if ( !isEqual( newValue, oldValue ) || !this.ready ) {
            // wrap the callback in a try-catch block, and only throw error in
            // debug mode
            try {
                this.callback.call( this.context, newValue, oldValue, this.keypath );
            } catch ( err ) {
                if ( this.debug || this.root.debug ) {
                    throw err;
                }
            }
        }

        this.updating = false;
    }
};

export default Observer;
