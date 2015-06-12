import ComputedNode from './nodes/ComputedNode';
import DataNode from './nodes/DataNode';

export default class Viewmodel extends DataNode {
	constructor ( options ) {
		super( null, null );

		this.isRoot = true;
		this.value = options.data;

		this.computationContext = options.ractive;
		this.computations = {};
	}

	applyChanges () {
		this._changeHash = {};
		this.flush();

		return this._changeHash;
	}

	compute ( key, signature ) {
		const computation = new ComputedNode( this, signature );
		this.computations[ key ] = computation;

		return computation;
	}

	getKeypath () {
		return '';
	}

	set ( value ) {
		throw new Error( 'TODO' );
	}

	teardown () {
		this.root = null; // is this enough?
	}

	update () {
		// noop
	}
}
