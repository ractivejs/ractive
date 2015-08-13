import { capture } from 'global/capture';
import { isEqual, isNumeric } from 'utils/is';
import { removeFromArray } from 'utils/array';
import { handleChange, mark, teardown } from 'shared/methodCallers';
import getPrefixer from './helpers/getPrefixer';
import { isArray, isObject } from 'utils/is';
import KeyModel from './specials/KeyModel';
import KeypathModel from './specials/KeypathModel';

const hasProp = Object.prototype.hasOwnProperty;

function updateFromBindings ( model ) {
	model.updateFromBindings( true );
}

function updateKeypathDependants ( model ) {
	model.updateKeypathDependants();
}

let originatingModel = null;

export default class Model {
	constructor ( parent, key ) {
		this.deps = [];

		this.children = [];
		this.childByKey = {};

		this.indexModels = [];

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

	createBranch ( key ) {
		const branch = isNumeric( key ) ? [] : {};
		this.set( branch );

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
						// special case - array.length. This is a horrible kludge, but
						// it'll do for now. Alternatives welcome
						if ( originatingModel && originatingModel.parent === model && originatingModel.key === 'length' ) {
							matches.push( originatingModel );
						}

						model.value.forEach( ( member, i ) => {
							matches.push( model.joinKey( i ) );
						});
					}

					else if ( isObject( model.value ) || typeof model.value === 'function' ) {
						Object.keys( model.value ).forEach( key => {
							matches.push( model.joinKey( key ) );
						});

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

	get ( shouldCapture ) {
		if ( shouldCapture ) capture( this );
		return this.value;
	}

	getIndexModel ( fragmentIndex ) {
		const indexModels = this.parent.indexModels;

		// non-numeric keys are a special of a numeric index in a object iteration
		if ( typeof this.key === 'string' && fragmentIndex !== undefined ) {
			return new KeyModel( fragmentIndex );
		} else if ( !indexModels[ this.key ] ) {
			indexModels[ this.key ] = new KeyModel( this.key );
		}

		return indexModels[ this.key ];
	}

	getKeyModel () {
		// TODO... different to IndexModel because key can never change
		return new KeyModel( this.key );
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

	joinKey ( key ) {
		if ( key === undefined || key === '' ) return this;

		if ( !this.childByKey.hasOwnProperty( key ) ) {
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
		const value = this.retrieve();

		if ( !isEqual( value, this.value ) ) {
			this.value = value;

			this.children.forEach( mark );

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

		const newIndices = oldArray.map( item => {
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

	retrieve () {
		return this.parent.value ? this.parent.value[ this.key ] : undefined;
	}

	set ( value ) {
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
			const parentValue = this.parent.value || this.parent.createBranch( this.key );
			parentValue[ this.key ] = value;

			this.value = value;
			this.adapt();
		}

		this.parent.clearUnresolveds();
		this.clearUnresolveds();

		// notify dependants
		const previousOriginatingModel = originatingModel; // for the array.length special case
		originatingModel = this;

		this.children.forEach( mark );
		this.deps.forEach( handleChange );

		let parent = this.parent;
		while ( parent ) {
			parent.deps.forEach( handleChange );
			parent = parent.parent;
		}

		originatingModel = previousOriginatingModel;
	}

	shuffle ( newIndices ) {
		const indexModels = [];
		newIndices.forEach( ( newIndex, oldIndex ) => {
			if ( !~newIndex ) return;

			const model = this.indexModels[ oldIndex ];

			if ( !model ) return;

			indexModels[ newIndex ] = model;

			if ( newIndex !== oldIndex ) {
				model.rebind( newIndex );
			}
		});

		this.indexModels = indexModels;

		// shuffles need to happen before marks...
		this.deps.forEach( dep => {
			if ( dep.shuffle ) dep.shuffle( newIndices );
		});

		this.updateKeypathDependants();
		this.mark();

		// ...but handleChange must happen after (TODO document why)
		this.deps.forEach( dep => {
			if ( !dep.shuffle ) dep.handleChange();
		});
	}

	teardown () {
		this.children.forEach( teardown );
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
		}
	}

	updateKeypathDependants () {
		this.children.forEach( updateKeypathDependants );
		if ( this.keypathModel ) this.keypathModel.handleChange();
	}
}
