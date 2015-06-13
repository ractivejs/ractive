import ComputedNode from './nodes/ComputedNode';
import DataNode from './nodes/DataNode';

export default class Viewmodel extends DataNode {
	constructor ( options ) {
		super( null, null );

		this.isRoot = true;
		this.value = options.data;

		this.mappings = {};

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

	join ( keys ) {
		const key = keys[0];

		const mapping = this.mappings[ key ] || this.computations[ key ];

		if ( mapping ) return mapping.join( keys.slice( 1 ) );
		return super.join( keys );
	}

	map ( localKey, origin ) {
		// TODO remapping
		this.mappings[ localKey ] = origin;
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
