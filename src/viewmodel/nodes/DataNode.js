import { capture } from 'global/capture';
import { isEqual, isNumeric } from 'utils/is';
import { removeFromArray } from 'utils/array';
import { handleChange, mark } from 'shared/methodCallers';

const hasOwnProperty = Object.prototype.hasOwnProperty;

export default class DataNode {
	constructor ( parent, key ) {
		this.deps = [];

		this.children = [];
		this.childByKey = {};

		this.value = undefined;

		if ( parent ) {
			this.parent = parent;
			this.viewmodel = parent.viewmodel;

			this.key = key;
			this.update();
		}
	}

	createBranch ( key ) {
		const branch = isNumeric( key ) ? [] : {};
		this.set( branch );

		return branch;
	}

	get () {
		capture( this );

		const parentValue = this.parent.value;
		if ( parentValue ) {
			return parentValue[ this.key ];
		}
	}

	getKeypath () {
		return this.parent.isRoot ? this.key : this.parent.getKeypath() + '.' + this.key;
	}

	has ( key ) {
		return hasOwnProperty.call( this.value, key );
	}

	join ( keys ) {
		const key = keys[0];

		if ( !this.childByKey[ key ] ) {
			const child = new DataNode( this, key );
			this.children.push( child );
			this.childByKey[ key ] = child;
		}

		const child = this.childByKey[ key ];

		return keys.length > 1 ?
			child.join( keys.slice( 1 ) ) :
			child;
	}

	mark () {
		const value = this.get();
		if ( !isEqual( value, this.value ) ) {
			this.value = value;

			this.deps.forEach( handleChange );
			this.children.forEach( mark );
		}
	}

	register ( dep ) {
		this.deps.push( dep );
	}

	set ( value ) {
		if ( isEqual( value, this.value ) ) return;

		const parentValue = this.parent.value || this.parent.createBranch( this.key );
		parentValue[ this.key ] = value;

		this.value = value;

		this.deps.forEach( handleChange );
		this.children.forEach( mark );

		let parent = this.parent;
		while ( parent ) {
			parent.deps.forEach( handleChange );
			parent = parent.parent;
		}
	}

	shuffle ( newIndices ) {
		let temp = [];

		newIndices.forEach( ( newIndex, oldIndex ) => {
			const child = this.childByKey[ oldIndex ];

			if ( !child || newIndex === oldIndex ) return;

			delete this.childByKey[ oldIndex ];

			if ( !~newIndex ) {
				removeFromArray( this.children, child );
			}

			else {
				temp.push({ newIndex, child });
				child.key = newIndex;
			}
		});

		temp.forEach( ({ newIndex, child }) => {
			this.childByKey[ newIndex ] = child;
		});

		this.mark();
		this.deps.forEach( dep => {
			if ( dep.shuffle ) {
				dep.shuffle( newIndices );
			} else {
				dep.handleChange();
			}
		});
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
