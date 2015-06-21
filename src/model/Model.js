import { capture } from 'global/capture';
import { isEqual, isNumeric } from 'utils/is';
import { removeFromArray } from 'utils/array';
import { handleChange, mark, teardown } from 'shared/methodCallers';
import getPrefixer from './helpers/getPrefixer';
import { isArray, isObject } from 'utils/is';
import IndexModel from './specials/IndexModel';
import KeyModel from './specials/KeyModel';
import KeypathModel from './specials/KeypathModel';

const hasProp = Object.prototype.hasOwnProperty;

function updateFromBindings ( model ) {
	model.updateFromBindings( true );
}

function updateKeypathDependants ( model ) {
	model.updateKeypathDependants();
}

export default class Model {
	constructor ( parent, key ) {
		this.deps = [];

		this.children = [];
		this.childByKey = {};

		this.indexedChildren = [];
		this.indexResolvers = [];

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

	clearUnresolveds ( specificKey ) {
		let i = this.unresolved.length;

		while ( i-- ) {
			const key = this.unresolved[i];

			if ( specificKey && key !== specificKey ) continue;

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

	createBranch ( key, silent ) {
		const branch = isNumeric( key ) ? [] : {};
		this.set( branch, silent );

		return branch;
	}

	findMatches ( keys ) {
		const len = keys.length;

		let existingMatches = [ this ];
		let matches;
		let i;

		for ( i = 0; i < len; i += 1 ) {
			const key = keys[i];

			if ( key === '*' ) {
				matches = [];
				existingMatches.forEach( model => {
					if ( isArray( model.value ) ) {
						model.value.forEach( ( member, i ) => {
							matches.push( model.joinKey( i ) );
						});
					}

					else if ( isObject( model.value ) || typeof model.value === 'function' ) {
						Object.keys( model.value ).forEach( key => {
							matches.push( model.joinKey( key ) );
						})

						// special case - computed properties. TODO mappings also?
						if ( model.isRoot ) {
							Object.keys( model.computations ).forEach( key => {
								matches.push( model.joinKey( key ) );
							});
						}
					}
				});
			} else {
				matches = existingMatches.map( model => model.joinKey( key ) );
			}

			existingMatches = matches;
		}

		return matches;
	}

	get () {
		capture( this ); // TODO should this happen here? do we want a non-side-effecty get()?

		const parentValue = this.parent.value;
		if ( parentValue ) {
			return parentValue[ this.key ];
		}
	}

	getIndexModel () {
		const indexResolvers = this.parent.indexResolvers;

		if ( !indexResolvers[ this.key ] ) {
			indexResolvers[ this.key ] = new IndexModel( this );
		}

		return indexResolvers[ this.key ];
	}

	getKeyModel () {
		return new KeyModel( this );
	}

	getKeypathModel () {
		return this.keypathModel || ( this.keypathModel = new KeypathModel( this ) );
	}

	getKeypath () {
		// TODO keypaths inside components... tricky
		return this.parent.isRoot ? this.key : this.parent.getKeypath() + '.' + this.key;
	}

	has ( key ) {
		return this.value && hasProp.call( this.value, key );
	}

	joinIndex ( index ) {
		if ( !this.indexedChildren[ index ] ) {
			this.indexedChildren[ index ] = new Model( this, index );
		}

		return this.indexedChildren[ index ];
	}

	joinKey ( key ) {
		if ( key === undefined || key === '' ) return this;

		if ( !this.childByKey[ key ] ) {
			const child = new Model( this, key );
			this.children.push( child );
			this.childByKey[ key ] = child;
		}

		return this.childByKey[ key ];
	}

	joinAll ( keys ) {
		let model = this;
		for ( let i = 0; i < keys.length; i += 1 ) {
			model = model.joinKey( keys[i] );
		}

		return model;
	}

	mark () {
		const value = this.get();

		if ( !isEqual( value, this.value ) ) {
			this.value = value;

			this.children.forEach( mark );
			this.indexedChildren.forEach( mark );

			this.deps.forEach( handleChange );
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

		// TODO deprecate this nonsense
		this.root.changes[ this.getKeypath() ] = value;

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
			const parentValue = this.parent.value || this.parent.createBranch( this.key, silent );
			parentValue[ this.key ] = value;

			this.value = value;
			this.adapt();
		}

		this.parent.clearUnresolveds();
		this.clearUnresolveds();

		if ( !silent ) {
			this.children.forEach( mark );
			this.indexedChildren.forEach( mark );
			this.deps.forEach( handleChange );

			let parent = this.parent;
			while ( parent ) {
				parent.deps.forEach( handleChange );
				parent = parent.parent;
			}
		}
	}

	shuffle ( newIndices ) {
		let indexedChildren = [];
		let indexResolvers = [];

		if ( this.indexedChildren.length ) {
			newIndices.forEach( ( newIndex, oldIndex ) => {
				if ( !~newIndex ) return; // TODO need to teardown e.g. ReferenceExpressionProxys?

				const model = this.indexedChildren[ oldIndex ];
				const indexResolver = this.indexResolvers[ oldIndex ];

				if ( newIndex === oldIndex ) {
					indexedChildren[ newIndex ] = model;
					indexResolvers[ newIndex ] = indexResolver;
					return;
				}

				if ( model ) {
					indexedChildren[ newIndex ] = model;
					model.key = newIndex;

					// any direct or downstream {{@keypath}} dependants need
					// to be notified of the change
					model.updateKeypathDependants();
				}

				if ( indexResolver ) {
					indexResolver.key = newIndex;
					indexResolver.handleChange();
				}
			});
		}

		this.indexedChildren = indexedChildren;
		this.indexResolvers = indexResolvers;

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
		this.indexedChildren.forEach( teardown );
		if ( this.wrapper ) this.wrapper.teardown();
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

		if ( cascade ) {
			this.children.forEach( updateFromBindings );
			this.indexedChildren.forEach( updateFromBindings );
		}
	}

	updateKeypathDependants () {
		this.children.forEach( updateKeypathDependants );
		this.indexedChildren.forEach( updateKeypathDependants );

		if ( this.keypathModel ) this.keypathModel.handleChange();
	}
}
