export default function () {
    if ( this._inited ) {
        throw new Error( 'Cannot initialize a transition more than once' );
    }

    this._inited = true;
    this._fn.apply( this.root, [ this ].concat( this.params ) );
};
