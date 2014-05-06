export default function ( eventName, callback ) {
    var self = this, listeners, n;

    // allow mutliple listeners to be bound in one go
    if ( typeof eventName === 'object' ) {
        listeners = [];

        for ( n in eventName ) {
            if ( eventName.hasOwnProperty( n ) ) {
                listeners.push( this.on( n, eventName[ n ] ) );
            }
        }

        return {
            cancel: function () {
                var listener;

                while ( listener = listeners.pop() ) {
                    listener.cancel();
                }
            }
        };
    }

    if ( !this._subs[ eventName ] ) {
        this._subs[ eventName ] = [ callback ];
    } else {
        this._subs[ eventName ].push( callback );
    }

    return {
        cancel: function () {
            self.off( eventName, callback );
        }
    };
};
