export default function ( eventName, callback ) {
    var subscribers, index;

    // if no callback specified, remove all callbacks
    if ( !callback ) {
        // if no event name specified, remove all callbacks for all events
        if ( !eventName ) {
            // TODO use this code instead, once the following issue has been resolved
            // in PhantomJS (tests are unpassable otherwise!)
            // https://github.com/ariya/phantomjs/issues/11856
            // defineProperty( this, '_subs', { value: create( null ), configurable: true });
            for ( eventName in this._subs ) {
                delete this._subs[ eventName ];
            }
        } else {
            this._subs[ eventName ] = [];
        }
    }

    subscribers = this._subs[ eventName ];

    if ( subscribers ) {
        index = subscribers.indexOf( callback );
        if ( index !== -1 ) {
            subscribers.splice( index, 1 );
        }
    }
};
