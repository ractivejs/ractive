import { isEqual } from 'utils/is';
import { removeFromArray } from 'utils/array';

export default class DataNode {
	constructor ( parent, key ) {
		this.parent = parent;
		this.key = key;

		this.deps = [];

		this.children = [];
		this.childByKey = {};

		this.value = undefined;
		this.update();
	}

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

	mark () {
		console.warn( 'TODO DataNode$mark' );
	}

	set ( value ) {
		if ( isEqual( value, this.value ) ) return;

		const parentValue = this.parent.value || this.parent.createBranch( this.key );
		parentValue[ this.key ] = value;

		this.mark();
	}

	unregister ( dependant ) {
		removeFromArray( this.deps, dependant );
	}

	update () {
		const parentValue = this.parent.value;
		if ( parentValue ) {
			this.value = parentValue[ this.key ];
		}
	}
}
