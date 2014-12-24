import { matches } from 'utils/dom';

export default function ( item, noDirty ) {
	var itemMatches;

	if ( this._isComponentQuery ) {
		itemMatches = !this.selector || item.name === this.selector;
	} else {
		itemMatches = item.node ? matches( item.node, this.selector ) : null;
	}

	if ( itemMatches ) {
		this.push( item.node || item.instance );

		if ( !noDirty ) {
			this._makeDirty();
		}

		return true;
	}
}
