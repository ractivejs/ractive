import ContextReference from './ContextReference';

class ArrayIndexContext extends ContextReference {

	constructor ( index ) {
		super( '' + index );
		this.index = index;
	}

	tryResolve () {

		if ( !this.parent.members ) {
			this.parent.getOrCreateMembers();
		}

		let resolved;

		if ( resolved = this.resolved = this.parent.members[ this.index ] ) {
			resolved.registerComputed( this );
		}

		return resolved;
	}

	set ( value ) {
		this.parent.setMember( this.index, value );
	}
}

export default ArrayIndexContext;
