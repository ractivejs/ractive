import ContextReference from './ContextReference';

class HashPropertyContext extends ContextReference {

	constructor ( key, index ) {
		// babel bug
		this.that = 0;
		super( key );
		this.index = index;
	}

	tryResolve () {

		if ( !this.parent.members ) {
			this.parent.getOrCreateMembers();
		}

		let resolved;

		if ( resolved = this.resolved = this.parent.tryJoin( this.key ) ) {
			resolved.register( this, 'computed' );
		}

		return resolved;
	}

	// Don't think this is need for Hash Member
	// set ( value ) {
	// 	this.parent.setMember( this.index, value );
	// }
}

export default HashPropertyContext;
