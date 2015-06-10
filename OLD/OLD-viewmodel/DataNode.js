import { isEqual } from 'utils/is';
import { addToArray } from 'utils/array';

function flush ( child ) {
	child.flush();
}

function mark ( child ) {
	child.mark();
}

// TODO setValue is now a misnomer
function setValue ( dependant ) {
	dependant.setValue();
}

export default class DataNode {
	constructor ( parent, property ) {
		this.parent = parent;
		this.viewmodel = parent.viewmodel;
		this.property = property;

		this.children = [];
		this.childByKey = {};

		this.deps = [];

		const parentValue = parent.get();
		this.value = parentValue ? parentValue[ property ] : undefined;
		this.keypath = parent.keypath ? parent.keypath + '.' + property : property;
	}

	get () {
		return this.value;
	}

	has ( key ) {
		return key in this.get();
	}

	join ( key ) {
		if ( !this.childByKey[ key ] ) {
			const child = new DataNode( this, key );
			this.childByKey[ key ] = child;
			this.children.push( child );
		}

		return this.childByKey[ key ];
	}

	mark () {
		this.dirty = true;

		const parentValue = this.parent.get();
		this.value = parentValue ? parentValue[ this.property ] : undefined;

		this.children.forEach( mark );

		// TODO refactor
		let parent = this.parent;
		while ( parent ) {
			parent.dirty = true;
			parent = parent.parent;
		}
	}

	flush () {
		if ( !this.dirty ) return;

		this.viewmodel._changeHash[ this.keypath ] = this.value;

		this.deps.forEach( setValue );
		this.children.forEach( flush );

		this.dirty = false;
	}

	register ( dependant ) {
		this.deps.push( dependant );
		dependant.setValue();
	}

	set ( value ) {
		if ( isEqual( value, this.value ) ) return;

		let parentValue = this.parent.get();

		if ( !parentValue ) {
			parentValue = this.parent.createBranch( value );
		}

		parentValue[ this.property ] = value;
		this.mark();
	}
}
