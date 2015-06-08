import { addToArray } from 'utils/array';
import { isArray, isEqual, isNumeric, isObject } from 'utils/is';

import HashPropertyContext from './HashPropertyContext';
import UnresolvedContext from './UnresolvedContext';
import ArrayIndexContext from './ArrayIndexContext';

import PropertyStore from '../stores/PropertyStore';
import StateStore from '../stores/StateStore';

import { register, unregister, notify, notifyChildren } from './BindingContext/notify';
import { getSpecial, markSpecials } from './BindingContext/specials';
import { shuffle, markLength } from './BindingContext/shuffle';
import { merge } from './BindingContext/merge';
import { addWatcher, removeWatcher, flushProperties } from './BindingContext/watcher';
import { hasChildFor} from './BindingContext/shared/hasChildren';

import getPrefixer from '../helpers/getPrefixer';

function toKeys ( keypath ) {
	return isArray( keypath ) ? keypath : ( '' + keypath ).split( '.' );
}

class BindingContext {

	constructor ( key, store ) {

		// track key, and index if applicable
		this.key = key || '';
		this.index = -1;

		// parent and the viewmodel owner
		this.parent = null;
		this.owner = null;

		// track child properties in one or more
		// of the following:
		// via hash for lookup in joining
		this.propertyHash = null;
		// via array for notifying all children
		this.properties = null;
		// array and hash members
		this.members = null;

		// dependants
		this.dependants = null;

		// watcher is created on request for notifying
		// on add of certain or all child keys
		this.watchers = null;
		// unresolved keys are stored on
		// nearest context so they can be shared
		this.unresolved = null;
		// ditto expressions
		this.expressions = null;

		this.store = store || new PropertyStore( key, this );
		this.wrapper = null;
		this.adapted = false;

		// stores the result of shuffle and merge for
		// passing as arg to notificaiton of dependants
		this.shuffled = null;

		// when marked it becomes dirty
		this.dirty = false;

		this.hashWatcher = null;
		this.isReconcilingMembers = false;
		this.isHashList = false;

		let _owner = this.owner;
		Object.defineProperty( this, 'owner', {
			get: function () {
				return _owner;
			},

			set: function ( owner ) {
				console.trace();
				_owner = owner;
			}
		})
	}

	adapt () {
		const viewmodel = this.owner;
		const len = this.owner.adaptors.length;
		let i;

		const value = this.store.get();

		// these are necessary for legacy reasons. Ideally we'd overhaul
		// the adaptors API in the near future
		const keypath = this.getKeypath();
		const ractive = this.owner.ractive;

		for ( i = 0; i < len; i += 1 ) {
			const adaptor = this.owner.adaptors[i];

			if ( adaptor.filter( value, keypath, ractive ) ) {
				this.wrapper = adaptor.wrap( ractive, value, keypath, getPrefixer( keypath ) );
				this.wrapper.value = value;
			}
		}

		this.adapted = true;
	}

	getKey () {
		var key = this.key;
		return key === '[*]' ? '' + this.index : key;
	}

	getKeypath () {
		var parentKey = this.parent.getKeypath(),
			key = this.getKey();
		return parentKey ? parentKey + '.' + key : key;
	}

	get () {
		if ( !this.adapted ) this.adapt();

		return ( this.wrapper || this.store ).get();
	}


	set ( value ) {
		// TODO remove isEqual stuff from this.store.set? can we do it
		// here instead, so behaviour is the same with adaptor/store?
		if ( isEqual( value, this.get() ) ) return;

		if ( this.parent && this.parent.wrapper ) {
			this.parent.wrapper.set( this.key, value );
		} else if ( this.wrapper ) {
			const shouldTeardown = !this.wrapper.reset || ( this.wrapper.reset( value ) === false );

			if ( shouldTeardown ) {
				this.wrapper.teardown();
				this.wrapper = null;
				this.store.set( value );
				this.adapt();
			}
		} else {
			this.store.set( value );
		}

		this.mark();
	}

	setMember ( index, value ) {

		const members = this.getOrCreateMembers(),
			  array = this.getSettable( index );

		// TODO: add more checks on this: null, etc.
		if( !members || !isArray( array ) ) {
			throw new Error('array method called on non-array');
		}

		this.store.setChild( index, value );
		this.updateOrCreateArrayMember( index, value );
		this.cascade( true );
	}

	getSettable ( propertyOrIndex ) {
		return this.store.getSettable ( propertyOrIndex );
	}

	mark () {

		// adjust members if this has been bound to list dependant
		if ( this.members ) {
			this.createOrReconcileMembers( this.get() );
		}

		if ( this.watchers ) {
			this.watchers.notifyAllMatches();
		}

		this.cascade();

		this.addAsChanged();

	}

	addAsChanged () {
		addToArray( this.owner.changes, this );

		if ( this.owner.ready ) {
			this.owner.onchange();
		}
	}

	cascade ( cascadeUpOnly ) {

		// bail if we've already been here...
		if ( this.dirty ) { return; }

		this.dirty = true;

		// tell properties and members, unless we're walking up the tree
		if ( !cascadeUpOnly ) {
			this.cascadeDown();
		}

		// all the way up the tree
		if ( this.parent ) {
			this.parent.cascade( true );
		}

		const dependants = this.dependants;
		// mark computed dependants as dirty
		if( dependants ) {
			dependants.notify( 'mark' );
		}
	}

	cascadeDown () {
		if ( this.members ) {
			this.createOrReconcileMembers( this.get() );
		}
		this.cascadeChildren( this.members );
		this.cascadeChildren( this.properties );
	}

	cascadeChildren ( children ) {
		if ( !children ) { return; }

		for( let i = 0, l = children.length; i < l; i++ ) {
			children[i].cascade();
		}
	}

	// reset any explicit member refs, e.g. `{{foo.2}}`
	resetArrayIndexContext ( index ) {
		let reference, properties = this.propertyHash;
		if ( properties && ( reference = properties[ index ] ) ) {
			reference.reset();
		}
	}

	createOrReconcileMembers ( value ) {

		if ( isArray( value ) ) {
			// hope that this can go away, hash watcher is lame
			this.removeHashWatcher();
			return this.createOrReconcileArrayMembers( value );
		}
		else if ( isObject( value ) ) {
			return this.createOrReconcileHashMembers( value );
		}
		else {
			this.isHashList = false;
			return this.members = [];
		}

	}

	createOrReconcileArrayMembers ( value ) {

		const l = value.length;
		let i = -1, members = this.members;

		// create new array
		if( !members || this.isHashList ) {
			this.members = members = new Array( l );
		}
		else {
			// or clear out of bounds references
			if ( members.length > l ) {
				let ml = members.length;
				for( let m = l; m < ml; m++ ) {
					this.resetArrayIndexContext( m );
				}
			}

			// adjust to actual length
			if ( members.length !== l ) {
				members.length = l;
			}
		}

		this.isHashList = false;

		while ( ++i < l ) {
			this.updateOrCreateArrayMember( i, value[i] );
		}

		return members;
	}

	updateOrCreateArrayMember ( index, value ) {
		const members = this.members, member = members[ index ];

		if ( member ) {
			member.set( value );
		}
		else {
			members[ index ] = this.createArrayMemberChild( value, index );
			this.resetArrayIndexContext( index );
		}
	}

	createOrReconcileHashMembers ( value ) {

		let i = -1, keys = Object.keys( value ), l = keys.length, key,
			members = this.members, member;

		this.isReconcilingMembers = true;

		// create new array
		if( !members || !this.isHashList ) {
			this.members = members = new Array( l );
		}
		// adjust to actual length
		else if ( members.length !== l ) {
			members.length = l;
		}

		this.isHashList = true;

		while ( ++i < l ) {

			let key = keys[i];

			// make sure the property child exists
			this.join( key );

			// update existing value
			if ( member = members[i] ) {
				if ( member.key !== key ) {
					member.reset();
					member.key = key;
				}
			}
			// add new value as a member
			else {
				members[i] = this.createHashMemberChild( keys[i], i );
			}
		}

		// Finding new properties seems like it should be much
		// easier. Using these flags are sucky too. But nothing
		// better yet comes to mind

		this.isReconcilingMembers = false;

		if ( !this.hashWatcher ) {
			this.hashWatcher = function( parent, child ){

				if ( this.isReconcilingMembers || child instanceof HashPropertyContext ) {
					return;
				}

				this.members.push( this.createHashMemberChild( child.key, this.members.length ) );

			}.bind( this );

			this.addWatcher( '*', this.hashWatcher, true );
		}

		return members;
	}

	removeHashWatcher () {
		var watcher = this.hashWatcher;
		if ( watcher ) {
			this.removeWatcher( '*', watcher );
			this.hashWatcher = null;
		}
	}

	getOrCreateMembers () {
		return this.members || this.createOrReconcileMembers( this.get() );
	}

	createArrayMemberChild ( value, index ) {
		let store = new StateStore( value ),
			context = new BindingContext( '[*]', store );

		context.index = index;
		this.addChild( context, context.key, false );
		return context;
	}

	createHashMemberChild ( key, index ) {
		let context = new HashPropertyContext( key, index );
		this.addChild( context, context.key, false );
		return context;
	}

	join ( keypath ) {
		return this.doJoin( toKeys( keypath ), false, true );
	}

	tryJoin ( keypath ) {
		return this.doJoin( toKeys( keypath ), true, true );
	}

	getJoinContext () {
		return this;
	}

	doJoin ( keys, testFirstKey = false, firstKey = false ) {
		const key = keys.shift();
		let child = this.findChild( key );

		if ( !child ) {

			child = this.getSpecial( key );

			// for a tryJoin, the first key has
			// to exist as a prop of this model
			if ( firstKey ) {
				if ( !child && testFirstKey && !this.hasChild( key ) ) {
					return;
				}
			}

			if ( !child ) {
				child = this.createChild( key );
			}

			this.addChild( child );
		}

		if ( keys.length ) {
			child = child.doJoin( keys );
		}

		return child;
	}

	findChild ( key ) {
		const hash = this.propertyHash;
		if ( hash && hash.hasOwnProperty( key ) ) {
			return hash[ key ];
		}
	}

	hashChild ( key, child ) {
		const hash = this.propertyHash || ( this.propertyHash = {} );
		hash[ key ] = child;
	}

	hasChild ( propertyOrIndex ) {
		return hasChildFor( this.get(), propertyOrIndex );
	}

	createChild ( key ) {
		return isNumeric( key ) ? new ArrayIndexContext( +key, this ) : new BindingContext( key );
	}

	addChild ( child, key = child.key, addToProperties = true ) {

		if ( !child.parent && !( child instanceof UnresolvedContext ) ) {
			child.parent = this;
			child.owner = this.owner;
		}

		if ( this.dirty && !child.dirty ) {
			child.dirty = true;
		}

		if ( addToProperties ) {
			if  ( key === child.key ) {
				this.properties ? this.properties.push( child ) : this.properties = [ child ];
			}
			this.hashChild( key, child );
		}

		if ( this.watchers ) {
			this.watchers.notify( key, child );
		}

		return child;
	}

	// TODO do we need a method like this?
	// Or is GC good to go? need to profile...
	// unbind () {
	// 	this.dependants = null;
	// 	this.watchers = null;
	// 	this.unresolved = null;
	// }
}

BindingContext.prototype.register = register;
BindingContext.prototype.unregister = unregister;
BindingContext.prototype.notify = notify;
BindingContext.prototype.notifyChildren = notifyChildren;

BindingContext.prototype.getSpecial = getSpecial;
BindingContext.prototype.markSpecials = markSpecials;

BindingContext.prototype.shuffle = shuffle;
BindingContext.prototype.markLength = markLength;

BindingContext.prototype.merge = merge;

BindingContext.prototype.addWatcher = addWatcher;
BindingContext.prototype.removeWatcher = removeWatcher;
BindingContext.prototype.flushProperties = flushProperties;


export default BindingContext;
