import { addToArray, removeFromArray } from 'utils/array';
import { isArray, isObject, isNumeric } from 'utils/is';
import getSpliceEquivalent from 'shared/getSpliceEquivalent';

import HashPropertyContext from './HashPropertyContext';
import ArrayIndexContext from './ArrayIndexContext';
import { IndexSpecial, KeySpecial, KeypathSpecial } from './SpecialContext';

import PropertyStore from '../stores/PropertyStore';
import StateStore from '../stores/StateStore';

import Watchers from './Watchers';
import hasChildFor from './shared/hasChildFor';

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
		this.computed = null;
		this.observers = null;
		this.views = null;
		this.listViews = null;

		// watcher is created on request
		// for certain child keys
		this.watchers = null;
		// unresolved keys are stored on
		// nearest context so they can be shared
		this.unresolved = null;

		this.store = store || new PropertyStore( key, this );

		this.splice = null;
		this.dirty = false;

		this.hashWatcher = null;
		this.isReconcilingMembers = false;
		this.isHashList = false;
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

	addWatcher ( key, handler ) {
		let watchers = this.watchers;

		if ( !watchers ) {
			watchers = this.watchers = new Watchers( this );
		}

		watchers.add( key, handler );
	}

	removeWatcher ( key, handler ) {
		let watchers = this.watchers;

		if ( watchers ) {
			watchers.remove( key, handler );
		}
	}

	getJoinModel () {
		return this;
	}

	join ( keypath ) {
		return this.doJoin( toKeys( keypath ), false, true );
	}

	tryJoin ( keypath ) {
		return this.doJoin( toKeys( keypath ), true, true );
	}

	doJoin ( keys, testFirstKey = false, firstKey = false ) {
		const key = keys.shift();
		let child = this.findChild( key );

		if ( !child ) {

			if ( firstKey ) {
				// specials
				// TODO: could it be nested like 'foo.bar.@index'?
				// or not worth extra === '@' on each loop?
				if ( key[0] === '@' ) {
					if ( key === '@index' ) {
						return this.createIndexChild();
					}
					else if ( key === '@key' ) {
						return this.createKeyChild();
					}
					else if ( key === '@keypath' ) {
						return this.createKeypathChild();
					}
				}

				// for a tryJoin, the first key has to exist as a prop of this model
				if ( !child && testFirstKey && !this.hasChild( key ) ) {
					return;
				}
			}

			child = this.createChild( key );
			this.addChild( child );
		}

		if ( keys.length ) {
			child = child.doJoin( keys );
		}

		return child;
	}

	hasChild ( propertyOrIndex ) {
		return hasChildFor( this.get(), propertyOrIndex );
	}

	createChild ( key ) {
		return isNumeric( key ) ? new ArrayIndexContext( +key, this ) : new BindingContext( key );
	}

	addChild ( child, key = child.key, addToProperties = true ) {

		if ( !child.parent ) {
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

	getKey () {
		var key = this.key;
		return key === '[*]' ? '' + this.index : key;
	}

	getKeypath () {
		var parentKey = this.parent.getKeypath(),
			key = this.getKey();
		return parentKey ? parentKey + '.' + key : key;
	}

	get ( options ) {
		return this.store.get();
	}


	set ( value, options ) {
		if ( this.store.set( value ) ) {
			this.mark();
		}
	}

	setMember ( index, value ) {

		const members = this.getOrCreateMembers(),
			  array = this.get();

		// TODO: add more checks on this: null, etc.
		if( !members || !isArray( array ) ) {
			throw new Error('array method called on non-array')
		}

		this.store.setChild( index, value );
		this.updateOrCreateArrayMember( index, value );
		this.cascade( true );
	}

	shuffle ( method, args ) {
		var members, array, oldLength, newLength, splice, result;

		members = this.members;
		array = this.get();

		// TODO: more on this: null, etc.
		if( !isArray( array ) ) {
			throw new Error( 'shuffle array method ' + method + ' called on non-array at ' + this.getKeypath() );
		}

		oldLength = array.length;
		splice = getSpliceEquivalent( oldLength, method, args );

		// this will modify the array
		result = this.store.shuffle( method, args );

		// sort or reverse
		if ( !splice ) {
			return this.set( array );
		}

		newLength = array.length;

		//make new members
		if ( members ) {
			if ( splice.length > 2 ) {
				let i = splice[0], replace = 2,
					end = i + ( splice.length - 2 );

				for ( ; i < end; replace++, i++ ) {
					splice[ replace ] = this.createArrayMemberChild( array[i], i );
					this.resetArrayIndexContext( i );
				}
			}

			members.splice.apply( members, splice );

			this.splice = {
				start: splice[0],
				remove: splice[1],
				insert: splice.length - 2
			};

			// Deal with index shifts
			if ( newLength !== oldLength ) {
				// inserts were already handled, so start from there
				let i = this.splice.start + this.splice.insert,
					length = Math.max( oldLength, newLength ),
					member;

				while ( i < length ) {

					if ( i < newLength ) {
						member = members[ i ];
						member.index = i;
						member.markSpecials();
					}

					this.resetArrayIndexContext( i );

					i++;
				}
			}
		}

		// TODO:
		// watchers
		// add to changes
		// .length

		this.cascade( true );
		this.addAsChanged();

		return result;
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

	// this is the only use of "owner",
	// meaning the owner viewmodel.
	// Could this dependency by moved and
	// thus removed from here?
	addAsChanged () {
		addToArray( this.owner.changes, this );

		if ( this.owner.ready ) {
			this.owner.onchange();
		}
	}

	// mark specials without marking the whole
	// array member dirty. Use in a shuffle operation
	// where the member is just being moved and only
	// the specials need to be updated
	markSpecials () {
		let special, s, specials, properties = this.propertyHash;

		if ( !properties ) {
			return;
		}

		specials = [ '@index', '@key', '@keypath' ];

		for ( s = 0; s < specials.length; s++ ) {
			if ( special = properties[ specials[s] ] ) {
				special.mark();
			}
		}
	}

	cascade ( cascadeUpOnly ) {
		const computed = this.computed;

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

		// mark computed dependants as dirty
		if( computed ) {
			for( let i = 0, l = computed.length; i < l; i++ ) {
				computed[i].mark();
			}
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

	getContext () {
		return this;
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
		let i = -1, members = this.members, member;

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
			if ( ( member = members[i] ) ) {
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

			this.addWatcher( '*', this.hashWatcher );
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

	registerComputed ( computed ) {
		if ( !this.computed ) {
			this.computed = [ computed ];
		}
		else {
			this.computed.push( computed );
		}
	}

	registerObserver ( observer ) {
		if ( !this.observers ) {
			this.observers = [ observer ];
		}
		else {
			this.observers.push( observer );
		}

		// this.notifyDependant( observer, this.get() );
	}

	registerView ( view ) {
		const value = this.get();

		if ( !this.views ) {
			this.views = [ view ];
		}
		else {
			this.views.push( view );
		}

		if ( value != null && value !== '' ) {
			this.notifyDependant( view, value );
		}
	}

	registerListView ( view ) {
		const value = this.get();

		if ( !this.listViews ) {
			this.listViews = [ view ];
		}
		else {
			this.listViews.push( view );
		}

		const members = this.getOrCreateMembers();

		if ( members.length ) {
			this.notifyListDependant( view, members );
		}
	}

	unregisterComputed ( computed ) {
		removeFromArray( this.computed, computed );
	}

	unregisterObserver ( observer ) {
		removeFromArray( this.observers, observer );
	}

	unregisterView ( view ) {
		removeFromArray( this.views, view );
	}

	unregisterListView ( view ) {
		removeFromArray( this.views, view );

		// TODO: Would it make sense to set
		// this.members = null if no more list dependants?
	}

	notify ( type ) {
		var dependants = this[ type ];

		if( !this.dirty ) {
			return;
		}

		if ( dependants ) {
			this.notifyDependants( dependants );
		}

		if( type === 'views' && ( dependants = this.listViews ) ) {
			if ( this.splice ) {
				this.updateListDependants( dependants );
			}
			else {
				this.notifyListDependants( dependants );
			}
		}

		// TODO is there better way to handle this?
		// maybe seperate "flush" method
		if( type === 'views' ) {
			this.dirty = false;
			this.splice = null;
		}

		this.notifyChildren( this.members, type );
		this.notifyChildren( this.properties, type );
	}

	notifyDependants ( dependants ) {
		const value = this.get(),
			  length = dependants.length;

		for( let i = 0; i < length; i++ ) {
			this.notifyDependant( dependants[i], value );
		}
	}

	notifyDependant ( dependant, value ) {
		// dependants may unregister themselves, so we
		// check that we are still getting a hit
		if( dependant ) {
			dependant.setValue( value );
		}
	}

	updateListDependants ( dependants ) {
		var splice = this.splice, dependant;

		for( let i = 0, l = dependants.length; i < l; i++ ) {
			dependant = dependants[i];
			if ( dependant.updateMembers ) {
				dependant.updateMembers( splice );
			}
		}
	}

	notifyListDependants ( dependants ) {
		const members = this.getOrCreateMembers(),
			  length = dependants.length;

		for( var i = 0; i < length; i++ ) {
			this.notifyListDependant( dependants[i], members );
		}
	}

	notifyListDependant ( dependant, members ) {
		// TODO: can we remove .setMembers check?
		if ( dependant && dependant.setMembers ) {
			dependant.setMembers( members );
		}
	}

	notifyChildren ( children, type ) {
		var i, l, child;

		if ( !children ) {
			return;
		}

		for( i = 0, l = children.length; i < l; i++ ) {
			child = children[i];
			if ( child.dirty ) {
				child.notify( type );
			}
		}
	}

	createIndexChild () {
		return this.createSpecialChild( '@index', IndexSpecial );
	}

	createKeyChild () {
		return this.createSpecialChild( '@key', KeySpecial );
	}

	createKeypathChild () {
		return this.createSpecialChild( '@keypath', KeypathSpecial );
	}

	createSpecialChild ( special, Special ) {
		var model;

		if ( !( model = this.findChild( special ) ) ) {
			this.addChild( model = new Special() );
		}

		return model;
	}

	unbind () {
		console.warn( 'TODO is Context#unbind necessary?' );
		this.dependants = null;
		this.listDependants = null;
		this.watchers = null;
		this.unresolved = null;
	}
};


function toKeys ( keypath ) {
	return isArray( keypath ) ? keypath : ( '' + keypath ).split( '.' );
}

export default BindingContext;
