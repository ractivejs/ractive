export default function () {
    if ( this.originalStyle ) {
        this.node.setAttribute( 'style', this.originalStyle );
    } else {

        // Next line is necessary, to remove empty style attribute!
        // See http://stackoverflow.com/a/7167553
        this.node.getAttribute( 'style' );
        this.node.removeAttribute( 'style' );
    }
};
