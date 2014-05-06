import circular from 'circular';
import warn from 'utils/warn';
import namespaces from 'config/namespaces';
import StringFragment from 'render/StringFragment/_StringFragment';

var DomFragment, updateCss, updateScript;

circular.push( function () {
    DomFragment = circular.DomFragment;
});

updateCss = function () {
    var node = this.node, content = this.fragment.toString();

    if ( node.styleSheet ) {
        node.styleSheet.cssText = content;
    } else {

        while ( node.hasChildNodes() ) {
            node.removeChild( node.firstChild );
        }

        node.appendChild( document.createTextNode(content) );
    }


};

updateScript = function () {
    if ( !this.node.type || this.node.type === 'text/javascript' ) {
        warn( 'Script tag was updated. This does not cause the code to be re-evaluated!' );
        // As it happens, we ARE in a position to re-evaluate the code if we wanted
        // to - we could eval() it, or insert it into a fresh (temporary) script tag.
        // But this would be a terrible idea with unpredictable results, so let's not.
    }

    this.node.text = this.fragment.toString();
};

export default function appendElementChildren ( element, node, descriptor, docFrag ) {
    // Special case - script and style tags
    if ( element.lcName === 'script' || element.lcName === 'style' ) {
        element.fragment = new StringFragment({
            descriptor:   descriptor.f,
            root:         element.root,
            owner:        element
        });

        if ( docFrag ) {
            if ( element.lcName === 'script' ) {
                element.bubble = updateScript;
                element.node.text = element.fragment.toString(); // bypass warning initially
            } else {
                element.bubble = updateCss;
                element.bubble();
            }
        }

        return;
    }

    element.fragment = new DomFragment({
        descriptor:    descriptor.f,
        root:          element.root,
        pNode:         node,
        owner:         element,
        pElement:      element,
    });

    if ( docFrag ) {
        node.appendChild( element.fragment.docFrag );
    }
};
