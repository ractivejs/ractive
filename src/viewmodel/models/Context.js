import { addToArray, removeFromArray } from 'utils/array';
import { isArray, isObject, isNumeric } from 'utils/is';
import createBranch from 'utils/createBranch';

import Reference from './Reference';
import ArrayMemberReference from './ArrayMemberReference';
import HashPropertyReference from './ArrayMemberReference';
import { IndexSpecial, KeySpecial, KeypathSpecial } from './Specials';

import PropertyStore from '../stores/PropertyStore';
import StateStore from '../stores/StateStore';

import getSpliceEquivalent from 'shared/getSpliceEquivalent';


function Context ( key, store ) {

	this.key = key || '';
	this.index = -1;

	this.store = store || new PropertyStore( key, this );

	this.parent = null;
	this.owner = null;

	this.propertyHash = null;
	this.properties = null;
	this.members = null;

	this.hashWatcher = null;
	this.isReconcilingMembers = false;
	this.isHashList = false;

	this.dependants = null;
	this.listDependants = null;
	this.watchers = null;
	this.unresolved = null;

	this.splice = null;

	this.dirty = false;

}

Context.prototype = {

	constructor: Context,

	findChild ( key ) {
		var hash = this.propertyHash;
		if ( !hash ) { return; }
		return hash[ key ];
	},

	hashChild ( key, child ) {
		var hash = this.propertyHash || ( this.propertyHash = {} );
		hash[ key ] = child;
	},

	getJoinModel () {
		return this;
	},

	join ( keypath ) {
		return this.doJoin( ( '' + keypath ).split( '.' ), false, true );
	},

	tryJoin ( keypath ) {
		return this.doJoin( ( '' + keypath ).split( '.' ), true, true );
	},

	doJoin ( keys, testFirstKey = false, firstKey = false ) {
		var key = keys.shift(),
			child = this.findChild( key );

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
	},

	createChild ( key ) {
		return isNumeric( key ) ? new ArrayMemberReference( +key, this ) : new Context( key );
	},

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

		// TODO: handle '*'
		this._notifyWatcher( key, child );

		return child;
	},

	_notifyWatcher ( key, child ) {
		let watcher = this._getWatcher( key );
		if( watcher ) {
			this._doNotifyWatcher( watcher.slice(), child );
		}
		// wildcard watcher
		if ( key !== '*' ) {
			watcher = this._getWatcher( '*' );
			if( watcher ) {
				this._doNotifyWatcher( watcher.slice(), child );
			}
		}
	},

	_doNotifyWatcher ( watcher, child ) {
		let watch;
		while ( watch = watcher.pop() ) {
			watch( this, child );
		}
	},

	_testWatchers () {
		var key, watchers = this.watchers;
		if( watchers ) {
			var value = this.get();
			for( key in watchers ){
				// a bit redundant with hasChild,
				// but don't want to fully refetch value
				if ( hasChildFor( value, key ) ) {
					this._doNotifyWatcher( watchers[ key ] );
				}
			}
		}
	},

	_getWatcher ( key ) {
		var watchers = this.watchers;
		return watchers ?  watchers[ key ] : null;
	},

	addWatcher ( key, handler ) {
		var watchers = this.watchers || ( this.watchers = {} ),
			watcher = watchers[ key ] || ( watchers[ key ] = [] );

		addToArray( watcher, handler );
	},

	removeWatcher ( key, handler ) {
		var watcher = this._getWatcher( key );
		if( watcher ) {
			removeFromArray( watcher, handler );
		}
	},

	getKey () {
		var key = this.key;
		return key === '[*]' ? '' + this.index : key;
	},

	getKeypath () {
		var parentKey = this.parent.getKeypath(),
			key = this.getKey();
		return parentKey ? parentKey + '.' + key : key;
	},

	/*
	join ( str ) {
		if ( this.isRoot ) {
			str = String( str );
			if( str[0] === '.' ) {
				// remove prepended with "." or "./"
				str = str.replace( /^\.\/?/, '' );
			}
		}
		else {
			if ( str[0] === '.' ) {
				// normalize prepended with "./"
				str = this.str + str.replace( /^\.\//, '.' );
			} else {
				str = this.str + '.' + str;
			}
		}

		// TODO: false positive for "0.4" - two numeric paths
		if ( isNumber( str ) ) {
			return this.indexJoin( +str );
		}

		return this.owner.getModel( str );
	}
	*/

	get ( options ) {
		return this.store.get();
	},

	hasChild ( propertyOrIndex ) {
		return hasChildFor( this.get(), propertyOrIndex );
	},

	set ( value, options ) {
		if ( this.store.set( value ) ) {
			this.mark();
		}
	},

	setMember ( index, value ) {

		var members, array;

		members = this.getOrCreateMembers();
		array = this.get();

		// TODO: more on this: null, etc.
		if( !members || !isArray( array ) ) {
			throw new Error('array method called on non-array')
		}

		this.store.setChild( index, value );
		// MUST TODO: this should be a set value on
		// existing member so we don't lose binding
		// ???
		this.members[ index ] = this.createArrayMemberChild( array[ index ], index );

		this.resetArrayMemberReference( index );

		this.cascade( true );
	},

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
					this.resetArrayMemberReference( i );
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

					// clean up any explicit member refs
					if ( i < oldLength ) {
						this.resetArrayMemberReference( i );
					}

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
	},

	getSettable ( propertyOrIndex ) {
		return this.store.getSettable ( propertyOrIndex );
	},

	mark ( /*options*/ ) {

		// adjust members if this has been bound to list dependant
		if ( this.members ) {
			this.createOrReconcileMembers( this.get() );
		}

		this._testWatchers();

		this.cascade();

		this.addAsChanged();

	},

	addAsChanged () {
		addToArray( this.owner.changes, this );

		if ( this.owner.ready ) {
			this.owner.onchange();
		}
	},

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
	},

	cascade ( cascadeUpOnly ) {
		var properties, dependants, computed, i, l;

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
		if( ( dependants = this.dependants ) && ( computed = dependants.computed ) ) {
			for( i = 0, l = computed.length; i < l; i++ ) {
				computed[i].mark();
			}
		}
	},

	cascadeDown () {
		if ( this.members ) {
			this.createOrReconcileMembers( this.get() );
		}
		this.cascadeChildren( this.members );
		this.cascadeChildren( this.properties );
	},

	cascadeChildren ( children ) {

		if ( !children ) { return; }

		for( let i = 0, l = children.length; i < l; i++ ) {
			children[i].cascade();
		}
	},

	getContext () {
		return this;
	},

	resetArrayMemberReference ( index ) {
		let reference, properties = this.propertyHash;
		if ( properties && ( reference = properties[ index ] ) ) {
			reference.reset();
		}
	},

	createOrReconcileMembers ( value ) {

		// TODO: deal with type shift on Reconcile
		// need to clean up hash watcher
		if ( isArray( value ) ) {
			return this.createOrReconcileArrayMembers( value );
		}
		else if ( isObject( value ) ) {
			return this.createOrReconcileHashMembers( value );
		}
		else {
			this.isHashList = false;
			return this.members = [];
		}

	},

	createOrReconcileArrayMembers ( value ) {

		let i = -1, l = value.length, members = this.members, member;

		// create new array
		if( !members || this.isHashList ) {
			this.members = members = new Array( l );
		}
		else {
			// or clear out of bounds references
			if ( members.length > l ) {
				let ml = members.length;
				for( let m = l; m < ml; m++ ) {
					this.resetArrayMemberReference( m );
				}
			}

			// adjust to actual length
			if ( members.length !== l ) {
				members.length = l;
			}
		}

		this.isHashList = false;

		while ( ++i < l ) {
			// update existing value
			if ( ( member = members[i] ) ) {
				member.set( value[i] );
			}
			// add new value as a member
			else {
				members[i] = this.createArrayMemberChild( value[i], i );
				this.resetArrayMemberReference( i );
			}
		}

		return members;
	},

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

				if ( this.isReconcilingMembers || child instanceof HashPropertyReference ) {
					return;
				}

				this.members.push( this.createHashMemberChild( child.key, this.members.length ) );

			}.bind( this );

			this.addWatcher( '*', this.hashWatcher );
		}

		return members;
	},

	removeHashWatcher () {
		var watcher = this.hashWatcher;
		if ( watcher ) {
			this.removeWatcher( '*', watcher );
			this.hashWatcher = null;
		}
	},

	getOrCreateMembers () {
		return this.members || this.createOrReconcileMembers( this.get() );
	},

	createArrayMemberChild ( value, index ) {
		let store = new StateStore( value ),
			context = new Context( '[*]', store );

		context.index = index;
		this.addChild( context, context.key, false );
		return context;
	},

	createHashMemberChild ( key, index ) {
		let context = new HashPropertyReference( key, index );
		this.addChild( context, context.key, false );
		return context;
	},

	register ( dependant, type = 'default' ) {

		// TODO: get rid of this
		if ( dependant.isStatic ) {
			throw new Error('register static dependant')
			return; // TODO we should never get here if a dependant is static...
		}

		var dependants = this.dependants || ( this.dependants = {} ), group;

		if( group = dependants[ type ] ) {
			group.push( dependant );
		}
		else {
			dependants[ type ] = [ dependant ];
		}

		if ( ( type === 'default' ) && this.get() != null ) {
			this.notifyDependants( [ dependant ] );
		}
	},

	listRegister ( dependant, type = 'default' ) {

		// TODO: get rid of this
		if ( dependant.isStatic ) {
			throw new Error('register static dependant')
			return; // TODO we should never get here if a dependant is static...
		}

		var dependants = this.listDependants || ( this.listDependants = {} ), group;

		if( group = dependants[ type ] ) {
			group.push( dependant );
		}
		else {
			dependants[ type ] = [ dependant ];
		}

		this.getOrCreateMembers();

		if ( ( type === 'default' ) && this.get() != null ) {
			this.notifyListDependants( [ dependant ] );
		}
	},

	unregister ( dependant, type = 'default' ) {

		// TODO: get rid of this
		if ( dependant.isStatic ) {
			throw new Error('unregister static dependant')
			return; // TODO we should never get here if a dependant is static...
		}

		var dependants = this.dependants, group;

		if( dependants && ( group = dependants[ type ] ) ) {
			removeFromArray( group, dependant );
		}
	},

	listUnregister ( dependant, type = 'default' ) {

		// TODO: get rid of this
		if ( dependant.isStatic ) {
			throw new Error('unregister static dependant')
			return; // TODO we should never get here if a dependant is static...
		}

		var dependants = this.listDependants, group;

		if ( dependants && ( group = dependants[ type ] ) ) {
			removeFromArray( group, dependant );

			// forgo doing any member work if no more list dependants
			if ( !group.length ) {
				delete dependants[ type ];

				if ( !dependants.computed && !dependants.observers && !dependants.default ) {
					this.members = null;
				}

				// TODO: clean up index stuff???
			}
		}
	},

	notify ( type ) {
		var dependants, group;

		if( !this.dirty ) { return; }

		if( ( dependants = this.dependants ) && ( group = dependants[ type ] ) ) {
			this.notifyDependants( group );
		}

		if( ( dependants = this.listDependants ) && ( group = dependants[ type ] ) ) {
			if ( this.splice ) {
				this.updateListDependants( group );
			}
			else {
				this.notifyListDependants( group );
			}
		}

		// TODO is there better way to handle this?
		// maybe seperate "flush" method
		if( type === 'default' ) {
			this.dirty = false;
			this.splice = null;
		}

		this.notifyChildren( this.members, type );
		this.notifyChildren( this.properties, type );
	},

	notifyDependants ( dependants ) {
		var value = this.get(), dependant;

		for( let i = 0, l = dependants.length; i < l; i++ ) {
			dependant = dependants[i];
			// dependants may unregister themselves, so we
			// check that we are still getting a result
			if( dependant ) {
				dependant.setValue( value );
			}
		}
	},

	updateListDependants ( dependants ) {
		var splice = this.splice, dependant;

		for( let i = 0, l = dependants.length; i < l; i++ ) {
			dependant = dependants[i];
			if ( dependant.updateMembers ) {
				dependant.updateMembers( splice );
			}
		}
	},

	notifyListDependants ( dependants ) {
		var members = this.getOrCreateMembers(), dependant;

		for( let i = 0, l = dependants.length; i < l; i++ ) {
			dependant = dependants[i];
			if ( dependant.setMembers ) {
				dependant.setMembers( members );
			}
		}
	},

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
	},

	createIndexChild () {
		return this.createSpecialChild( '@index', IndexSpecial );
	},

	createKeyChild () {
		return this.createSpecialChild( '@key', KeySpecial );
	},

	createKeypathChild () {
		return this.createSpecialChild( '@keypath', KeypathSpecial );
	},

	createSpecialChild ( special, Special ) {
		var model;

		if ( !( model = this.findChild( special ) ) ) {
			this.addChild( model = new Special() );
		}

		return model;
	},

}


function hasChildFor ( value, key ) {
	if ( value == null ) {
		return false;
	}
	if ( ( typeof value === 'object' || typeof value === 'function' ) && ( key in value ) ) {
		return true;
	}
	return false;
}

export default Context;
