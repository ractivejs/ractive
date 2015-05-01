import Reference from './Reference';

class HashPropertyReference extends Reference {

	constructor ( key, index ) {
		// babel bug
		this.that = 0;
		super( key );
		this.index = index;
	}

	resolve () {
		if ( this.resolved ) {
			return;
		}

		if ( !this.parent.members ) {
			this.parent.getOrCreateMembers();
		}

		let resolved;

		if ( resolved = this.resolved = this.parent.tryJoin( this.key ) ) {
			resolved.register( this, 'computed' );
		}
	}

	// Don't think this is need for Hash Member
	// set ( value ) {
	// 	this.parent.setMember( this.index, value );
	// }
}
