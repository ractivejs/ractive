import KeyModel from './specials/KeyModel';
import KeypathModel from './specials/KeypathModel';
import { escapeKey, unescapeKey } from '../shared/keypaths';
import { handleChange, notifiedUpstream } from '../shared/methodCallers';
import { addToArray, removeFromArray } from '../utils/array';
import { isArray, isObject } from '../utils/is';
import bind from '../utils/bind';
import runloop from '../global/runloop';

const hasProp = Object.prototype.hasOwnProperty;

const shuffleTasks = { early: [], mark: [] };
const registerQueue = { early: [], mark: [] };

export default class ModelBase {
	constructor ( parent ) {
		this.deps = [];

		this.children = [];
		this.childByKey = {};
		this.links = [];

		this.keyModels = {};

		this.unresolved = [];
		this.unresolvedByKey = {};

		this.bindings = [];
		this.patternObservers = [];

		if ( parent ) {
			this.parent = parent;
			this.root = parent.root;
		}
	}

	addUnresolved ( key, resolver ) {
		if ( !this.unresolvedByKey[ key ] ) {
			this.unresolved.push( key );
			this.unresolvedByKey[ key ] = [];
		}

		this.unresolvedByKey[ key ].push( resolver );
	}

	addShuffleTask ( task, stage = 'early' ) { shuffleTasks[stage].push( task ); }
	addShuffleRegister ( item, stage = 'early' ) { registerQueue[stage].push({ model: this, item }); }

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
					matches.push.apply( matches, model.getValueChildren( model.get() ) );
				});
			} else {
				matches = existingMatches.map( model => model.joinKey( key ) );
			}

			existingMatches = matches;
		}

		return matches;
	}

	getKeyModel ( key, skip ) {
		if ( key !== undefined && !skip ) return this.parent.getKeyModel( key, true );

		if ( !( key in this.keyModels ) ) this.keyModels[ key ] = new KeyModel( escapeKey( key ), this );

		return this.keyModels[ key ];
	}

	getKeypath ( ractive ) {
		if ( ractive !== this.ractive && this._link ) return this._link.target.getKeypath( ractive );

		if ( !this.keypath ) {
			this.keypath = this.parent.isRoot ? this.key : `${this.parent.getKeypath( ractive )}.${escapeKey( this.key )}`;
		}

		return this.keypath;
	}

	getValueChildren ( value ) {
		let children;
		if ( isArray( value ) ) {
			children = [];
			if ( 'length' in this && this.length !== value.length ) {
				children.push( this.joinKey( 'length' ) );
			}
			value.forEach( ( m, i ) => {
				children.push( this.joinKey( i ) );
			});
		}

		else if ( isObject( value ) || typeof value === 'function' ) {
			children = Object.keys( value ).map( key => this.joinKey( key ) );
		}

		else if ( value != null ) {
			return [];
		}

		return children;
	}

	getVirtual ( shouldCapture ) {
		const value = this.get( shouldCapture, { virtual: false } );
		if ( isObject( value ) ) {
			const result = isArray( value ) ? [] : {};

			const keys = Object.keys( value );
			let i = keys.length;
			while ( i-- ) {
				const child = this.childByKey[ keys[i] ];
				if ( !child ) result[ keys[i] ] = value[ keys[i] ];
				else if ( child._link ) result[ keys[i] ] = child._link.getVirtual();
				else result[ keys[i] ] = child.getVirtual();
			}

			i = this.children.length;
			while ( i-- ) {
				const child = this.children[i];
				if ( !( child.key in result ) && child._link ) {
					result[ child.key ] = child._link.getVirtual();
				}
			}

			return result;
		} else return value;
	}

	has ( key ) {
		if ( this._link ) return this._link.has( key );

		const value = this.get();
		if ( !value ) return false;

		key = unescapeKey( key );
		if ( hasProp.call( value, key ) ) return true;

		// We climb up the constructor chain to find if one of them contains the key
		let constructor = value.constructor;
		while ( constructor !== Function && constructor !== Array && constructor !== Object ) {
			if ( hasProp.call( constructor.prototype, key ) ) return true;
			constructor = constructor.constructor;
		}

		return false;
	}

	joinAll ( keys, opts ) {
		let model = this;
		for ( let i = 0; i < keys.length; i += 1 ) {
			if ( opts && opts.lastLink === false && i + 1 === keys.length && model.childByKey[keys[i]] && model.childByKey[keys[i]]._link ) return model.childByKey[keys[i]];
			model = model.joinKey( keys[i], opts );
		}

		return model;
	}

	notifyUpstream () {
		let parent = this.parent;
		const path = [ this.key ];
		while ( parent ) {
			if ( parent.patternObservers.length ) parent.patternObservers.forEach( o => o.notify( path.slice() ) );
			path.unshift( parent.key );
			parent.links.forEach( notifiedUpstream );
			parent.deps.forEach( handleChange );
			parent = parent.parent;
		}
	}

	rebinding ( next, previous, safe ) {
		// tell the deps to move to the new target
		let i = this.deps.length;
		while ( i-- ) {
			if ( this.deps[i].rebinding ) this.deps[i].rebinding( next, previous, safe );
		}

		i = this.links.length;
		while ( i-- ) {
			const link = this.links[i];
			// only relink the root of the link tree
			if ( link.owner._link ) link.relinking( next, true, safe );
		}

		i = this.children.length;
		while ( i-- ) {
			const child = this.children[i];
			child.rebinding( next ? next.joinKey( child.key ) : undefined, child, safe );
		}

		i = this.unresolved.length;
		while ( i-- ) {
			const unresolved = this.unresolvedByKey[ this.unresolved[i] ];
			let c = unresolved.length;
			while ( c-- ) {
				unresolved[c].rebinding( next, previous );
			}
		}

		if ( this.keypathModel ) this.keypathModel.rebinding( next, previous, false );

		i = this.bindings.length;
		while ( i-- ) {
			this.bindings[i].rebinding( next, previous, safe );
		}
	}

	register ( dep ) {
		this.deps.push( dep );
	}

	registerChange ( key, value ) {
		if ( !this.isRoot ) {
			this.root.registerChange( key, value );
		} else {
			this.changes[ key ] = value;
			runloop.addInstance( this.root.ractive );
		}
	}

	registerLink ( link ) {
		addToArray( this.links, link );
	}

	registerPatternObserver ( observer ) {
		this.patternObservers.push( observer );
		this.register( observer );
	}

	registerTwowayBinding ( binding ) {
		this.bindings.push( binding );
	}

	removeUnresolved ( key, resolver ) {
		const resolvers = this.unresolvedByKey[ key ];

		if ( resolvers ) {
			removeFromArray( resolvers, resolver );
		}
	}

	shuffled () {
		let i = this.children.length;
		while ( i-- ) {
			this.children[i].shuffled();
		}
		if ( this.wrapper ) {
			this.wrapper.teardown();
			this.wrapper = null;
			this.rewrap = true;
		}
	}

	unregister ( dependant ) {
		removeFromArray( this.deps, dependant );
	}

	unregisterLink ( link ) {
		removeFromArray( this.links, link );
	}

	unregisterPatternObserver ( observer ) {
		removeFromArray( this.patternObservers, observer );
		this.unregister( observer );
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

		// check for one-way bindings if there are no two-ways
		if ( !this.bindings.length ) {
			const oneway = findBoundValue( this.deps );
			if ( oneway && oneway.value !== this.value ) this.set( oneway.value );
		}

		if ( cascade ) {
			this.children.forEach( updateFromBindings );
			this.links.forEach( updateFromBindings );
			if ( this._link ) this._link.updateFromBindings( cascade );
		}
	}
}

// TODO: this may be better handled by overreiding `get` on models with a parent that isRoot
export function maybeBind ( model, value, shouldBind ) {
	if ( shouldBind && typeof value === 'function' && model.parent && model.parent.isRoot ) {
		if ( !model.boundValue ) {
			model.boundValue = bind( value._r_unbound || value, model.parent.ractive );
		}

		return model.boundValue;
	}

	return value;
}

function updateFromBindings ( model ) {
	model.updateFromBindings( true );
}

export function findBoundValue( list ) {
	let i = list.length;
	while ( i-- ) {
		if ( list[i].bound ) {
			const owner = list[i].owner;
			if ( owner ) {
				const value = owner.name === 'checked' ?
					owner.node.checked :
					owner.node.value;
				return { value };
			}
		}
	}
}

export function fireShuffleTasks ( stage ) {
	if ( !stage ) {
		fireShuffleTasks( 'early' );
		fireShuffleTasks( 'mark' );
	} else {
		const tasks = shuffleTasks[stage];
		shuffleTasks[stage] = [];
		let i = tasks.length;
		while ( i-- ) tasks[i]();

		const register = registerQueue[stage];
		registerQueue[stage] = [];
		i = register.length;
		while ( i-- ) register[i].model.register( register[i].item );
	}
}

KeyModel.prototype.addShuffleTask = ModelBase.prototype.addShuffleTask;
KeyModel.prototype.addShuffleRegister = ModelBase.prototype.addShuffleRegister;
KeypathModel.prototype.addShuffleTask = ModelBase.prototype.addShuffleTask;
KeypathModel.prototype.addShuffleRegister = ModelBase.prototype.addShuffleRegister;
