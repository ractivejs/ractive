import { isArray } from 'utils/is';
import compareArrays from './merge/compareArrays';

export function merge ( array, options ) {

	const oldArray = this.get();

	// short-circuit if same array has been assigned :)
	if ( oldArray === array ) {
		return;
	}

	// If either the existing value or the new value
	// isn't an array, just do a regular set
	if ( !isArray( oldArray ) || !isArray( array ) ) {
		return this.set( array );
	}

	const compare = options ? options.compare : null,
		  indicesMap = compareArrays( oldArray, array, compare ),
		  oldMembers = this.members,
		  oldValues = oldArray.slice(),
		  newMembers = this.members = [],
		  deleted = [],
		  inserted = [];

	for ( let i = 0, l = indicesMap.length; i < l; i++ ) {
		let existing = indicesMap[i], indexChange = true;
		// no mapped member to merge
		if ( existing === -1 ) {
			let value = array[i];
			newMembers[i] = this.createArrayMemberChild( value, i );
			inserted.push( value );
		}
		// reuse existing member
		else {
			newMembers[i] = oldMembers[ existing ];
			oldValues[i] = void 0;
			// did it change its index?
			indexChange = ( i !== existing );
		}

		// reset any direct index ref like `{{foo.2}}`
		if ( indexChange ) {
			this.resetArrayIndexContext( i );
		}
	}

	for ( let i = 0, l = oldValues.length; i < l; i++ ) {
		let value = oldValue[i];
		if ( value ) {
			deleted.push( value );
		}
	}

	// actually update the array in the stroe
	this.store.set( array );

	this.shuffled = {
		inserted,
		deleted,
		map: indicesMap
	}

	// mark length property as dirty if it's being tracked
	if ( array.length !== oldArray.length ) {
		this.markLength();
	}

	this.cascade( true );
	this.addAsChanged();
}
