import Reference from './Reference';

class ArrayMemberReference extends Reference {

	constructor ( index ) {
		super( '' + index );
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

		if ( resolved = this.resolved = this.parent.members[ this.index ] ) {
			resolved.register( this, 'computed' );
		}
	}

	set ( value ) {
		this.parent.setMember( this.index, value );
	}
}

export default ArrayMemberReference;
