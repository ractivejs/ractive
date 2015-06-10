// import getSpliceEquivalent from 'shared/getSpliceEquivalent';
import { isArray } from 'utils/is';

const arrayProto = Array.prototype;

// TODO remove this, it's a quick hack for tiding us over
function getSpliceEquivalent ( array, oldLength, newLength, newIndices ) {
	let spliceStart = oldLength; // push by default
	let i;

	for ( i = 0; i < oldLength; i += 1 ) {
		if ( newIndices[i] !== i ) {
			spliceStart = i;
			break;
		}
	}

	let removeCount = 0;

	for ( ; i < oldLength; i += 1 ) {
		if ( newIndices[i] === -1 ) {
			removeCount += 1;
		} else {
			break;
		}
	}

	const newIndex = newIndices[i];
	let splice = array.slice( spliceStart, newIndex );

	splice.unshift( spliceStart, removeCount );
	return splice;
}

export function shuffle ( newIndices ) {

	const array = this.get();
	const oldLength = newIndices.length;
	const newLength = array.length;

	const members = this.members;

	// TODO temporary?... seems like it might be easier to just
	// use newIndices
	const splice = getSpliceEquivalent( array, oldLength, newLength, newIndices );

	const inserted = splice.slice( 2 );
	//const deleted = getDeleted( method, result );

	// TODO how much of this do we need to expose?
	this.shuffled = {
		members,
		inserted,
		deleted: null, // TODO. This is used in the new ListObserver, but is problematic for getting existing stuff to work
		splice: {
			start: splice[0],
			deleteCount: splice[1],
			insertCount: splice.length - 2
		}
	};

	// adjust members if they're being tracked
	if ( members ) {
		if ( splice.length > 2 ) {
			let i = splice[0], replace = 2,
				end = i + ( splice.length - 2 ),
				member;

			for ( ; i < end; replace++, i++ ) {
				member = splice[ replace ] = this.createArrayMemberChild( array[i], i );
				member.dirty = true;
				this.resetArrayIndexContext( i );
			}
		}

		// adjust members array to match data array
		members.splice.apply( members, splice );

		// Deal with index shifts and length change
		if ( newLength !== oldLength ) {
			const length = Math.max( oldLength, newLength );
			// inserts were already handled, so start from there:
			let i = this.shuffled.start + this.shuffled.insertCount;

			while ( i < length ) {
				if ( i < newLength ) {
					let member = members[ i ];
					member.index = i;
					// mark specials without marking
					// the whole array member dirty
					member.markSpecials();
				}
				this.resetArrayIndexContext( i );
				i++;
			}

		}
	}

	// mark length property as dirty if it's being tracked
	if ( newLength !== oldLength ) {
		this.markLength();
	}

	this.cascade( true );
	this.addAsChanged();
}

export function markLength () {
	let lengthProperty = this.findChild( 'length' );
	if ( lengthProperty ) {
		lengthProperty.mark();
	}
}
