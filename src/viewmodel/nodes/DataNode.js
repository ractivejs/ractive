import { capture } from 'global/capture';
import { isEqual, isNumeric } from 'utils/is';
import { removeFromArray } from 'utils/array';
import { handleChange, mark, teardown } from 'shared/methodCallers';
import getPrefixer from '../helpers/getPrefixer';

const hasOwnProperty = Object.prototype.hasOwnProperty;

function updateFromBindings ( model ) {
	model.updateFromBindings();
}

export default class DataNode {
	constructor ( parent, key ) {
		this.deps = [];

		this.children = [];
		this.childByKey = {};

		this.unresolved = [];
		this.unresolvedByKey = {};

		this.bindings = [];

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

	addUnresolved ( key, resolver ) {
		if ( !this.unresolvedByKey[ key ] ) {
			this.unresolved.push( key );
			this.unresolvedByKey[ key ] = [];
		}

		this.unresolvedByKey[ key ].push( resolver );
	}

	clearUnresolveds () {
		let i = this.unresolved.length;

		while ( i-- ) {
			const key = this.unresolved[i];
			const resolvers = this.unresolvedByKey[ key ];
			const hasKey = this.has( key );

			let j = resolvers.length;
			while ( j-- ) {
				if ( hasKey ) resolvers[j].attemptResolution();
				if ( resolvers[j].resolved ) resolvers.splice( j, 1 );
			}

			if ( !resolvers.length ) {
				this.unresolved.splice( i, 1 );
				this.unresolvedByKey[ key ] = null;
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

		// TODO can we simply avoid this situation elsewhere?
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
			this.clearUnresolveds();
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

	registerTwowayBinding ( binding ) {
		this.bindings.push( binding );
	}

	set ( value, silent ) {
		if ( isEqual( value, this.value ) ) return;

		if ( this.parent.wrapper && this.parent.wrapper.set ) {
			this.parent.wrapper.set( this.key, value );
			this.parent.value = this.parent.wrapper.get();

			this.value = this.parent.value[ this.key ];
			// TODO should this value be adapted? probably
		} else if ( this.wrapper ) {
			const shouldTeardown = !this.wrapper.reset || this.wrapper.reset( value ) === false;

			if ( shouldTeardown ) {
				this.wrapper.teardown();
				this.wrapper = null;
				this.parent.value[ this.key ] = this.value = value;
				this.adapt();
			} else {
				this.value = this.wrapper.get();
			}
		} else {
			const parentValue = this.parent.value || this.parent.createBranch( this.key );
			parentValue[ this.key ] = value;

			this.value = value;
			this.adapt();
		}

		this.clearUnresolveds();

		if ( !silent ) {
			this.deps.forEach( handleChange );
			this.children.forEach( mark );

			let parent = this.parent;
			while ( parent ) {
				parent.deps.forEach( handleChange );
				parent = parent.parent;
			}
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

	teardown () {
		this.children.forEach( teardown );

		if ( this.wrapper ) this.wrapper.teardown();
		this.children = this.childByKey = this.deps = this.computations = null;
	}

	unregister ( dependant ) {
		removeFromArray( this.deps, dependant );
	}

	unregisterTwowayBinding ( binding ) {
		removeFromArray( this.bindings, binding );
	}

	updateFromBindings ( cascade ) {
		let i = this.bindings.length;
		while ( i-- ) {
			const value = this.bindings[i].getValue();
			if ( value !== this.value ) this.set( value );
		}

		if ( cascade ) this.children.forEach( updateFromBindings );
	}
}
