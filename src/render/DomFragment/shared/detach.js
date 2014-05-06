export default function () {
    var node = this.node, parentNode;

    if ( node && ( parentNode = node.parentNode ) ) {
        parentNode.removeChild( node );
        return node;
    }
};
