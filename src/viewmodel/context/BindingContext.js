import { addToArray } from 'utils/array';
import { isArray, isObject } from 'utils/is';
import getSpliceEquivalent from 'shared/getSpliceEquivalent';

import HashPropertyContext from './HashPropertyContext';

import PropertyStore from '../stores/PropertyStore';
import StateStore from '../stores/StateStore';

import Watchers from './BindingContext/Watchers';
import { register, unregister, notify, notifyChildren } from './BindingContext/notify';
import { join, tryJoin, getJoinContext, doJoin, findChild, hashChild, hasChild, createChild, addChild } from './BindingContext/children';
import { getSpecial, markSpecials } from './BindingContext/specials';
import { hasChildFor, hasKeys } from './shared/hasChildren';

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

		// watcher is created on request
		// for certain child keys
		this.watchers = null;
		// unresolved keys are stored on
		// nearest context so they can be shared
		this.unresolved = null;
		// ditto expressions
		this.expressions = null;

		this.store = store || new PropertyStore( key, this );

		this.shuffled = null;
		this.dirty = false;

		this.hashWatcher = null;
		this.isReconcilingMembers = false;
		this.isHashList = false;
	}

	addWatcher ( key, handler, noInit ) {
		const watchers = this.watchers || ( this.watchers = new Watchers( this ) );

		watchers.add( key, handler, noInit );

		if ( key === '*' && !noInit ) {
			this.flushProperties( watchers );
		}
	}

	removeWatcher ( key, handler ) {
		const watchers = this.watchers;

		if ( watchers ) {
			watchers.remove( key, handler );
		}
	}

	flushProperties ( watchers ) {
		const value = this.get();

		if ( isArray( value ) && !this.members ) {
			this.getOrCreateMembers();
		}
		else if ( hasKeys( value ) ) {
			const keys = Object.keys( value );

			let key, context;
			for ( var i = 0, l = keys.length; i < l; i++ ) {
				key = keys[i];
				context = this.findChild( key );
				if ( context ) {
					watchers.notify( key, context );
				}
				else {
					this.join( key );
				}
			}
		}
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
		return this.store.get();
	}


	set ( value ) {
		if ( this.store.set( value ) ) {
			this.mark();
		}
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

	shuffle ( method, args ) {

		const members = this.members,
			  array = this.get(),
			  oldLength = array.length;

		// TODO: more on this: null, etc.
		if( !isArray( array ) ) {
			throw new Error( 'shuffle array method ' + method + ' called on non-array at ' + this.getKeypath() );
		}

		const splice = getSpliceEquivalent( oldLength, method, args );

		// this will modify the array
		const deleted = this.store.shuffle( method, args );

		// sort or reverse
		if ( !splice ) {
			return this.set( array );
		}

		const inserted = splice.slice( 2 ),
			  newLength = array.length;

		this.shuffled = {
			inserted,
			deleted,
			start: splice[0],
			deleteCount: splice[1],
			insertCount: splice.length - 2
		};

		// if anyone's tracking yet, make new members
		if ( members ) {
			if ( splice.length > 2 ) {
				let i = splice[0], replace = 2,
					end = i + ( splice.length - 2 ),
					member;

				for ( ; i < end; replace++, i++ ) {
					member = splice[ replace ] = this.createArrayMemberChild( array[i], i );
					member.dirty = true;
					this.resetArrayIndexContext( i );
				}
			}

			members.splice.apply( members, splice );

			// Deal with index shifts and length change
			if ( newLength !== oldLength ) {
				// inserts were already handled, so start from there
				const length = Math.max( oldLength, newLength );
				let i = this.shuffled.start + this.shuffled.insertCount,
					member, lengthProperty;

				while ( i < length ) {

					if ( i < newLength ) {
						member = members[ i ];
						member.index = i;
						// mark specials without marking
						// the whole array member dirty
						member.markSpecials();
					}

					this.resetArrayIndexContext( i );

					i++;
				}

			}
		}

		let lengthProperty;

		if ( newLength !== oldLength && ( lengthProperty = this.findChild( 'length' ) ) )  {
			lengthProperty.mark();
		}

		// TODO:
		// watchers
		// add to changes

		this.cascade( true );
		this.addAsChanged();

		return deleted;
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

BindingContext.prototype.join = join;
BindingContext.prototype.tryJoin = tryJoin;
BindingContext.prototype.getJoinContext = getJoinContext;
BindingContext.prototype.doJoin = doJoin;
BindingContext.prototype.findChild = findChild;
BindingContext.prototype.hashChild = hashChild;
BindingContext.prototype.hasChild = hasChild;
BindingContext.prototype.createChild = createChild;
BindingContext.prototype.addChild = addChild;

BindingContext.prototype.getSpecial = getSpecial;
BindingContext.prototype.markSpecials = markSpecials;


export default BindingContext;
