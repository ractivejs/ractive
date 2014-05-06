import matches from 'utils/matches';

export default function ( item, noDirty ) {
    var itemMatches = ( this._isComponentQuery ? ( !this.selector || item.name === this.selector ) : ( matches( item.node, this.selector ) ) );

    if ( itemMatches ) {
        this.push( item.node || item.instance );

        if ( !noDirty ) {
            this._makeDirty();
        }

        return true;
    }
};
