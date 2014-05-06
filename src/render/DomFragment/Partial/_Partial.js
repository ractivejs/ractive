import types from 'config/types';
import getPartialDescriptor from 'render/DomFragment/Partial/getPartialDescriptor';
import applyIndent from 'render/DomFragment/Partial/applyIndent';
import circular from 'circular';

var DomPartial, DomFragment;

circular.push( function () {
    DomFragment = circular.DomFragment;
});

DomPartial = function ( options, docFrag ) {
    var parentFragment = this.parentFragment = options.parentFragment, descriptor;

    this.type = types.PARTIAL;
    this.name = options.descriptor.r;
    this.index = options.index;

    if ( !options.descriptor.r ) {
        // TODO support dynamic partial switching
        throw new Error( 'Partials must have a static reference (no expressions). This may change in a future version of Ractive.' );
    }

    descriptor = getPartialDescriptor( parentFragment.root, options.descriptor.r );

    this.fragment = new DomFragment({
        descriptor:   descriptor,
        root:         parentFragment.root,
        pNode:        parentFragment.pNode,
        owner:        this
    });

    if ( docFrag ) {
        docFrag.appendChild( this.fragment.docFrag );
    }
};

DomPartial.prototype = {
    firstNode: function () {
        return this.fragment.firstNode();
    },

    findNextNode: function () {
        return this.parentFragment.findNextNode( this );
    },

    detach: function () {
        return this.fragment.detach();
    },

    reassign: function ( indexRef, newIndex, oldKeypath, newKeypath ) {
        return this.fragment.reassign( indexRef, newIndex, oldKeypath, newKeypath );
    },

    teardown: function ( destroy ) {
        this.fragment.teardown( destroy );
    },

    toString: function () {
        var string, previousItem, lastLine, match;

        string = this.fragment.toString();

        previousItem = this.parentFragment.items[ this.index - 1 ];

        if ( !previousItem || ( previousItem.type !== types.TEXT ) ) {
            return string;
        }

        lastLine = previousItem.descriptor.split( '\n' ).pop();

        if ( match = /^\s+$/.exec( lastLine ) ) {
            return applyIndent( string, match[0] );
        }

        return string;
    },

    find: function ( selector ) {
        return this.fragment.find( selector );
    },

    findAll: function ( selector, query ) {
        return this.fragment.findAll( selector, query );
    },

    findComponent: function ( selector ) {
        return this.fragment.findComponent( selector );
    },

    findAllComponents: function ( selector, query ) {
        return this.fragment.findAllComponents( selector, query );
    }
};

export default DomPartial;
