import types from 'config/types';
import detach from 'render/DomFragment/shared/detach';

var DomComment = function ( options, docFrag ) {
    this.type = types.COMMENT;
    this.descriptor = options.descriptor;

    if ( docFrag ) {
        this.node = document.createComment( options.descriptor.c );
        docFrag.appendChild( this.node );
    }
};

DomComment.prototype = {
    detach: detach,

    teardown: function ( destroy ) {
        if ( destroy ) {
            this.detach();
        }
    },

    firstNode: function () {
        return this.node;
    },

    toString: function () {
        return '<!--' + this.descriptor.c + '-->';
    }
};

export default DomComment;
