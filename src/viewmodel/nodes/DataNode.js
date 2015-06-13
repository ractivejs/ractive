import { capture } from 'global/capture';
import { isEqual, isNumeric } from 'utils/is';
import { removeFromArray } from 'utils/array';
import { handleChange, mark } from 'shared/methodCallers';
import getPrefixer from '../helpers/getPrefixer';

const hasOwnProperty = Object.prototype.hasOwnProperty;

export default class DataNode {
	constructor ( parent, key ) {
		this.deps = [];

		this.children = [];
		this.childByKey = {};

		this.value = undefined;

		if ( parent ) {
			this.parent = parent;
			this.root = parent.root;
			this.key = key;

			if ( parent.value ) {
				this.value = parent.value[ this.key ];
				this.adapt();
			}
		}
	}

	adapt () {
		const adaptors = this.root.adaptors;
		const value = this.value;
		const len = adaptors.length;

		// TODO remove this legacy nonsense
		const ractive = this.root.ractive;
		const keypath = this.getKeypath();

		let i;

		for ( i = 0; i < len; i += 1 ) {
			const adaptor = adaptors[i];
			if ( adaptor.filter( value, keypath, ractive ) ) {
				this.wrapper = adaptor.wrap( ractive, value, keypath, getPrefixer( keypath ) );
				this.wrapper.value = this.value;
				this.wrapper.__model = this; // massive temporary hack to enable array adaptor
				this.value = this.wrapper.get();

				break;
			}
		}
	}

	createBranch ( key ) {
		const branch = isNumeric( key ) ? [] : {};
		this.set( branch );

		return branch;
	}

	get () {
		capture( this ); // TODO should this happen here? do we want a non-side-effecty get()?

		const parentValue = this.parent.value;
		if ( parentValue ) {
			return parentValue[ this.key ];
		}
	}

	getKeypath () {
		// TODO keypaths inside components... tricky
		return this.parent.isRoot ? this.key : this.parent.getKeypath() + '.' + this.key;
	}

	has ( key ) {
		return hasOwnProperty.call( this.value, key );
	}

	join ( keys ) {
		const key = keys[0];

		if ( keys.length === 0 || ( keys.length === 1 && key === '' ) ) return this;

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

	merge ( array, comparator ) {
		const oldArray = comparator ? this.value.map( comparator ) : this.value;
		const newArray = comparator ? array.map( comparator ) : array;

		const oldLength = oldArray.length;

		let usedIndices = {};
		let firstUnusedIndex = 0;

		const newIndices = oldArray.map( function ( item, i ) {
			let index;
			let start = firstUnusedIndex;

			do {
				index = newArray.indexOf( item, start );

				if ( index === -1 ) {
					return -1;
				}

				start = index + 1;
			} while ( ( usedIndices[ index ] === true ) && start < oldLength );

			// keep track of the first unused index, so we don't search
			// the whole of newArray for each item in oldArray unnecessarily
			if ( index === firstUnusedIndex ) {
				firstUnusedIndex += 1;
			}
			// allow next instance of next "equal" to be found item
			usedIndices[ index ] = true;
			return index;
		});

		this.parent.value[ this.key ] = array;
		this._merged = true;
		this.shuffle( newIndices );
	}

	register ( dep ) {
		this.deps.push( dep );
	}

	set ( value ) {
		if ( isEqual( value, this.value ) ) return;

		if ( this.parent.wrapper && this.parent.wrapper.set ) {
			this.parent.wrapper.set( this.key, value );
			this.parent.value = this.parent.wrapper.get();

			this.value = this.parent.value[ this.key ];
		} else if ( this.wrapper ) {
			const shouldTeardown = !this.wrapper.reset || this.wrapper.reset( value ) === false;

			if ( shouldTeardown ) {
				this.wrapper.teardown();
				this.wrapper = null;
				this.value = value;
				this.adapt();
			} else {
				this.value = this.wrapper.get();
			}
		} else {
			const parentValue = this.parent.value || this.parent.createBranch( this.key );
			parentValue[ this.key ] = value;

			this.value = value;
		}

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
}
