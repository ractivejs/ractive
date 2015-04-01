import Reference from './Reference';

class IndexReference extends Reference {

	constructor ( index, parent ) {
		super( '' + index );
		this.index = index;
		parent.register( this );
	}

	resolve () {
		if ( this.resolved ) {
			return;
		}

		let resolved;

		if ( resolved = this.parent.members[ i ] ) {
			resolved.register( this, 'computed' );
		}
	}
}

export default IndexReference;
