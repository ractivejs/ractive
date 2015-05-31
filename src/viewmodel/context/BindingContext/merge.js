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
		  mergeMap = compareArrays( oldArray, array, compare ),
		  oldMembers = this.members,
		  oldValues = oldArray.slice(),
		  members = this.members = [],
		  deleted = [],
		  inserted = [];

	for ( let i = 0, l = mergeMap.length; i < l; i++ ) {
		let existing = mergeMap[i], indexChange = true;
		// no mapped member to merge
		if ( existing === -1 ) {
			let value = array[i];
			members[i] = this.createArrayMemberChild( value, i );
			inserted.push( value );
		}
		// reuse existing member
		else {
			members[i] = oldMembers[ existing ];
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
		let value = oldValues[i];
		if ( value ) {
			deleted.push( value );
		}
	}

	// actually update the array in the stroe
	this.store.set( array );

	this.shuffled = {
		members,
		inserted,
		deleted,
		mergeMap
	};

	// mark length property as dirty if it's being tracked
	if ( array.length !== oldArray.length ) {
		this.markLength();
	}

	this.cascade( true );
	this.addAsChanged();
}
