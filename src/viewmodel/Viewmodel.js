import ComputedNode from './nodes/ComputedNode';
import DataNode from './nodes/DataNode';

export default class Viewmodel {
	constructor ( options ) {
		this.value = options.data;

		this.computations = {};

		this.children = [];
		this.childByKey = {};
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

	// flush () {
	// 	if ( this.dirty ) {
	// 		this.children.forEach( child => child.flush() );
	// 	}
	// }

	has ( key ) {
		return key in this.value;
	}

	join ( key ) {
		if ( !this.childByKey[ key ] ) {
			const child = new DataNode( this, key );
			this.children.push( child );
			this.childByKey[ key ] = child;
		}

		return this.childByKey[ key ];
	}

	set ( value ) {
		throw new Error( 'TODO' );
	}

	teardown () {
		this.root = null; // is this enough?
	}
}
