import { addToArray, removeFromArray } from 'utils/array';
import { isArray, isNumeric } from 'utils/is';
import createBranch from 'utils/createBranch';

import PropertyStore from '../stores/PropertyStore';
import StateStore from '../stores/StateStore';

import getSpliceEquivalent from 'shared/getSpliceEquivalent';

var FAILED_LOOKUP = {};

var refPattern, modelCache, Keypath;

refPattern = /\[\s*(\*|[0-9]|[1-9][0-9]+)\s*\]/g;

modelCache = {};

function Model ( key, store ) {

	this.key = key || '';
	this.index = -1;

	this.store = store || new PropertyStore( key, this );

	this.parent = null;
	this.owner = null;

	this.dirty = false;
	this.propertyHash = null;

	this.properties = null;
	this.members = null;

	this.dependants = null;
	this.watchers = null;
	this.splice = null;


	// for development debug purposes:
	// if ( true /*owner.debug*/ ) {
	// 	this.ownerName = this.owner.ractive.component ? this.owner.ractive.component.name : 'Ractive';
	// }
}

Model.prototype = {

	constructor: Model,

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
		return this._doJoin( keypath, false );
	},

	tryJoin ( keypath ) {
		return this._doJoin( keypath, true );
	},

	_doJoin ( keypath, testFirstKey ) {
		var keys = ( '' + keypath ).split( '.' ), key,
			child, parent = this, firstKey = true;

		while ( key = keys.shift() ) {

			child = parent.findChild( key );

			if ( !child ) {

				if ( firstKey ) {
					// specials
					// TODO: could it be nested like 'foo.bar.@index'?
					// or not worth extra === '@' on each loop?
					if ( key[0] === '@' ) {
						if ( key === '@index' ) {
							return parent.createIndexChild();
						}
						else if ( key === '@key' ) {
							return parent.createStateChild( '@key', parent.key );
						}
						else if ( key === '@keypath' ) {
							// TODO: this will need work different to be "dynamic" and properly aliased
							return parent.createStateChild( '@keypath', parent.getKeypath() );
						}
					}

					// for a tryJoin, the first key has to exist as a prop of this model
					if ( !child && testFirstKey && !this.hasChild( key ) ) {
						return;
					}
				}


				child = isNumeric( key ) ? new MemberReference( +key, parent ) : new Model( key );
				parent.addChild( child );
			}
			parent = child;
			firstKey = false;
		}

		return child;
	},

	addChild ( child, key = child.key ) {

		if ( !child.parent ) {
			child.parent = this;
			child.owner = this.owner;
		}

		if ( this.dirty && !child.dirty ) {
			child.dirty = true;
		}

		if ( key !== '*' ) {
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
		let watcher = this._getWatcher( key ), length, i;
		if( watcher ) {
			this._doNotifyWatcher( watcher.slice(), child );
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

	getKeypath () {
		var parentKey = this.parent.getKeypath(), key = this.key;

		if ( key === '*' ) {
			key = '' + this.index;
		}

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
			// adjust members if this was/is an array
			if ( this.members ) {
				this.createMembers( value );
			}

			this.mark();
		}
	},

	shuffle ( method, ...args ) {
		var members = this.members;

		if(!members){
			throw new Error('array method called on non-array')
		}
		// TODO: nonaray, null, etc.
		var array = this.get();
		// pre-modication length
		var splice = getSpliceEquivalent( array.length, method, args );

		// this will mod the array
		var result = this.store.shuffle( method, args );

		//make new members
		if ( splice.length > 2 ) {
			let i = splice[0],
				replace = 2,
				end = i + ( splice.length - 2 );

			for ( ; i < end; replace++, i++ ) {
				splice[ replace ] = this.createMemberChild( array[i], i );
				this.resetMemberReference( i );
			}
		}

		members.splice.apply( members, splice );

		this.splice = {
			start: splice[0],
			remove: splice[1],
			insert: splice.length - 2
		};

		// did we have an index shift for remaining members?
		if ( this.splice.remove !== this.splice.insert ) {
			let i = this.splice.start + this.splice.remove,
				l = members.length,
				member;

			while ( i < l ) {
				member = members[ i ];
				member.index = i;
				this.resetMemberReference( i );
				member.markSpecials();
				i++;
			}
		}

		// TODO:
		// watchers
		// add to changes
		// .length

		this.cascade( true );

		return result;
	},

	getSettable ( propertyOrIndex ) {
		return this.store.getSettable ( propertyOrIndex );
	},

	mark ( /*options*/ ) {

		this._testWatchers();

		this.cascade();

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
			this.cascadeChildren( this.members );
			this.cascadeChildren( this.properties );
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

	cascadeChildren ( children ) {

		if ( !children ) { return; }

		for( let i = 0, l = children.length; i < l; i++ ) {
			children[i].cascade();
		}
	},

	getContext () {
		return this;
	},

	resetMemberReference ( index ) {
		let reference;
		if ( reference = this.propertyHash[ index ] ) {
			reference.reset();
		}
	},

	createMembers ( value ) {

		if ( !isArray( value ) ) {
			return this.members = null;
		}

		let i = -1, l = value.length, members = this.members, member;

		if( members && members.length > l ) {
			// MemberReferences out of bounds need to clear their reference
			for( let m = (l - 1); m < l; m++ ) {
				this.resetMemberReference( m );
			}
			// adjust to actual length
			members.length = l;
		}
		// create new array
		else {
			this.members = members = new Array( l );
		}

		while ( ++i < l ) {
			// update existing value
			if ( member = members[i] ) {
				member.set( value[i] );
			}
			// add new value as a member
			else {
				members[i] = this.createMemberChild( value[i], i );
			}
		}

		return members;
	},

	getMembers () {
		return this.members || this.createMembers( this.get() );
	},

	createMemberChild ( value, index ) {
		let store = new StateStore( value ),
			model = new Model( '*', store );

		model.index = index;
		this.addChild( model );
		// model.mark();
		return model;
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
	},

	unregister ( dependant, type = 'default' ) {

		// TODO: get rid of this
		if ( dependant.isStatic ) {
			return; // TODO we should never get here if a dependant is static...
		}

		if ( !( type === 'default' || type === 'computed'   || type === 'observers'  ) ) {
			this.owner.unregister( this, dependant, type );
		}

		var dependants = this.dependants, group;

		if( dependants && ( group = this.dependants[ type ] ) ) {
			removeFromArray( group, dependant );
		}
	},

	notify ( type ) {
		var dependants, dependant, group, value, members, i, l;

		if( !this.dirty ) { return; }


		if( ( dependants = this.dependants ) && ( group = dependants[ type ] ) ) {
			if ( this.splice ) {
				for( i = 0, l = group.length; i < l; i++ ) {
					dependant = group[i];

					if ( dependant.updateMembers ) {
						dependant.updateMembers( this.splice );
					}
				}
			}
			else {
				value = this.get();
				members = isArray( value ) ? this.getMembers() : null;

				for( i = 0, l = group.length; i < l; i++ ) {
					dependant = group[i];

					if( dependant.setValue ) {
						dependant.setValue( value );
					}

					if ( dependant.setMembers ) {
						dependant.setMembers( members );
					}
				}
			}
		}

		// TODO find better way to handle this.
		// maybe seperate "flush" method
		if( type === 'default' ) {
			this.dirty = false;
			this.splice = null;
		}

		this.notifyChildren( this.members, type );
		this.notifyChildren( this.properties, type );
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

	indexJoin ( index, aliases ) {
		return this.createStateChildren( index + '', index, index, aliases );
	},

	keyJoin ( key, index, aliases ) {
		return this.createStateChildren( key, key, index, aliases );
	},

	keyContext () {
		var key = this.getKeypath();
		this.createStateChild( '@keypath', key );
	},

	createStateChildren ( propertyOrIndex, key, index, aliases ) {
		var child, alias;

		child = this.join( propertyOrIndex );

		if ( aliases ) {
			if ( alias = aliases.find( ref => ref.t ==='k' ) ) {
				child.createStateChild( '@key', key, alias );
			}
			if ( alias = aliases.find( ref => ref.t ==='i' ) ) {
				child.createIndexChild( alias );
			}
		}

		return child;
	},

	aliasIndices ( alias ) {
		// TODO: handle being called twice, unwatch, etc.
		var members = this.members;
		if ( members ) {
			for ( let i = 0, l = members.length; i < l; i++ ) {
				members[i].createIndexChild( alias );
			}

		}

		this.addWatcher( '*', function( parent, child ){
			if ( !child ) { return; }
			child.createIndexChild( alias );
		});
	},

	createIndexChild ( alias ) {
		var model;

		if ( !( model = this.findChild( '@index' ) ) ) {
			this.addChild( model = new Index() );
			// TODO remove (test if not needed):
			model.mark();
		}

		if ( alias && !this.findChild( alias ) ) {
			this.addChild( model, alias );
		}

		return model;
	},

	createStateChild ( key, state, alias ) {
		var model;

		if ( !( model = this.findChild( key ) ) ) {
			model = new Model( key, new StateStore( state ) );
			this.addChild( model );
		}

		if ( alias && !this.findChild( key = alias.n ) ) {
			this.addChild( model, key );
		}

		return model;
	},

}

// circular module reference causing pain,
// so here for now
var noopStore = {};

class Index extends Model {

	constructor () {
		this.that = 0;
		super( '@index', noopStore );
	}

	get () {
		return this.parent.index;
	}

	set () {
		throw new Error('cannot set @index');
	}
}

class Reference extends Model {

	constructor ( key ) {
		this.resolved = null;
		super( key, noopStore );
	}

	getJoinKey () {
		return this.key;
	}

	get () {
		this.resolve();

		let resolved;
		if ( resolved = this.resolved ) {
			return resolved.get();
		}
	}

	resolve () {
		if ( this.resolved ) {
			return;
		}

		let resolved,
			joinParent = this.parent.getJoinModel(),
			key = this.getJoinKey();

		if ( joinParent && key != null ) {
			resolved = this.resolved = joinParent.join( key );
		}

		if ( resolved ) {
			resolved.register( this, 'computed' );
		}
	}


	set ( value ) {
		var resolved = this.resolved;
		if ( !resolved ) {
			if ( typeof value !== 'undefined' ) {
				throw new Error('Reference set called without resolved.');
			}
			return;
		}

		resolved.set( value );
	}

	reset () {
		if ( this.resolved ) {
			this.resolved.unregister( this, 'computed' );
			this.resolved = null;
		}

		this.mark();

		this.resetChildren( this.properties );
		// TODO: do members need to be reset ???

	}

	resetChildren ( children ) {
		if ( !children ) { return; }

		for( let i = 0, l = children.length; i < l; i++ ) {
			children[i].reset();
		}
	}

	getJoinModel () {
		this.resolve();
		let resolved = this.resolved;
		if ( !resolved ) {
			// TODO:  create new ProxyModel() ????
			throw new Error('Reference getJoinModel called without resolved.');
		}
		return resolved;
	}

	// TODO: tryJoin

	join ( keypath ) {

		this.resolve();
		if ( !this.resolved ) {
			throw new Error('attempt to join unresolved reference');
		}

		var keys = ( '' + keypath ).split( '.' ),
			key,
			childRef,
			parent = this;

		while ( key = keys.shift() ) {
			childRef = this.propertyHash[ key ]
			if ( !childRef ) {
				childRef = new Reference( key );
				parent.addChild( childRef );
			}
			parent = childRef;
		}

		return childRef;
	}

}

class MemberReference extends Reference {

	constructor ( index, parent ) {
		super( '' + index );
		this.index = index;
		parent.register( this );
	}

	resolve () {
		if ( this.resolved ) {
			return;
		}

		let resolved;

		if ( resolved = this.resolved = this.parent.members[ this.index ] ) {
			resolved.register( this, 'computed' );
		}
	}

	setMembers () {
		this.resetIfChanged();
	}

	resetIfChanged () {
		if ( this.parent.members[ this.index ] !== this.resolved ) {
			this.reset();
		}
	}

	updateMembers ( splice ) {
		if ( this.index >= splice.start ) {
			this.resetIfChanged();
		}
	}
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

export default Model;
