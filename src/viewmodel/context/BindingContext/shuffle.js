import getSpliceEquivalent from 'shared/getSpliceEquivalent';
import { isArray } from 'utils/is';

const arrayProto = Array.prototype;

export function shuffle ( method, args ) {

	const array = this.get();

	// TODO: more on this? null, etc.
	if( !isArray( array ) ) {
		throw new Error( 'shuffle array method ' + method + ' called on non-array at ' + this.getKeypath() );
	}

	const members = this.members,
		  oldLength = array.length,
		  splice = getSpliceEquivalent( oldLength, method, args ),
		  // this next call modifies the array!
		  result = arrayProto[ method ].apply( array, args );

	// !splice means sort or reverse, treat it like a set and be done
	if ( !splice ) {
		return this.mark();
	}

	const inserted = splice.slice( 2 ),
		  deleted = getDeleted( method, result ),
		  newLength = array.length;

	this.shuffled = {
		members,
		inserted,
		deleted,
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

	return result;
}

export function markLength () {
	let lengthProperty = this.findChild( 'length' );
	if ( lengthProperty ) {
		lengthProperty.mark();
	}
}

function getDeleted( method, result ) {
	switch ( method ) {
    	case 'splice':
    		return result;
    	case 'pop':
		case 'shift':
			return [ result ];
		default:
			return [];
    }
}
