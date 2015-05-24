import { IndexSpecial, KeySpecial, KeypathSpecial } from '../SpecialContext';

const INDEX_SPECIAL   = '@index',
	  KEY_SPECIAL 	  = '@key',
	  KEYPATH_SPECIAL = '@keypath';

// kludgey hash map because it was
// giving max call stack errror with esperanto :(
var SPECIALS;
function getSpecials() {
	if ( !SPECIALS ) {
		SPECIALS = {
			[ INDEX_SPECIAL ]: IndexSpecial,
			[ KEY_SPECIAL ]: KeySpecial,
			[ KEYPATH_SPECIAL ]: KeypathSpecial
	    };
	}
	return SPECIALS;
}

export function getSpecial ( key ) {
	const Special = getSpecials()[ key ];
	if ( Special ) {
		return new Special();
	}
}

export function markSpecials () {
	const properties = this.propertyHash;

	if ( !properties ) {
		return;
	}

	let special;

	if ( special = properties[ INDEX_SPECIAL ] ) {
		special.mark();
	}
	if ( special = properties[ KEY_SPECIAL ] ) {
		special.mark();
	}
	if ( special = properties[ KEYPATH_SPECIAL ] ) {
		special.mark();
	}
}
