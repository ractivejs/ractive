import types from 'config/types';
import teardown from 'shared/teardown';
import Mustache from 'render/shared/Mustache/_Mustache';
import detach from 'render/DomFragment/shared/detach';

var DomInterpolator, lessThan, greaterThan;
lessThan = /</g;
greaterThan = />/g;

DomInterpolator = function ( options, docFrag ) {
    this.type = types.INTERPOLATOR;

    if ( docFrag ) {
        this.node = document.createTextNode( '' );
        docFrag.appendChild( this.node );
    }

    // extend Mustache
    Mustache.init( this, options );
};

DomInterpolator.prototype = {
    update: Mustache.update,
    resolve: Mustache.resolve,
    reassign: Mustache.reassign,
    detach: detach,

    teardown: function ( destroy ) {
        if ( destroy ) {
            this.detach();
        }

        teardown( this );
    },
    
    render: function ( value ) {
        if ( this.node ) {
            this.node.data = ( value == undefined ? '' : value );
        }
    },

    firstNode: function () {
        return this.node;
    },

    toString: function () {
        var value = ( this.value != undefined ? '' + this.value : '' );
        return value.replace( lessThan, '&lt;' ).replace( greaterThan, '&gt;' );
    }
};

export default DomInterpolator;
