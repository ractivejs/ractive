import { addToArray, removeFromArray } from 'utils/array';
import { isNumber } from 'utils/is';
import createBranch from 'utils/createBranch';
import getPotentialWildcardMatches from 'utils/getPotentialWildcardMatches';

import { DataStore, PropertyStore, StateStore } from './store';


var FAILED_LOOKUP = {};

var refPattern, modelCache, Keypath;

refPattern = /\[\s*(\*|[0-9]|[1-9][0-9]+)\s*\]/g;

modelCache = {};

class Model {

	constructor ( key, store ) {

		this.key = key || '';
		this.store = store || new PropertyStore( key, this );

		this.parent = null;
		this.owner = null;

		this.dirty = false;
		this.contextCache = null;
		this.dependants = null;
		this.children = null;
		this.watchers = null;

		// for development debug purposes:
		// if ( true /*owner.debug*/ ) {
		// 	this.ownerName = this.owner.ractive.component ? this.owner.ractive.component.name : 'Ractive';
		// }
	}

	isContext () {
		return !!this.contextCache;
	}

	tryGetChild ( key ) {
		return this.contextCache[ key ];
	}

	cacheChild ( key, child ) {
		this.contextCache[ key ] = child;
	}

	startContext () {
		if ( this.isContext() ) { return; }
		addChildKeysToCache( this.contextCache = {}, this );
	}

	join ( keypath ) {
		return this._doJoin( keypath, false );
	}

	tryJoin ( keypath ) {
		return this._doJoin( keypath, true );
	}

	_doJoin ( keypath, testFirstKey ) {
		var found, child, parent, keys, key;

		found = this._findInCache( keypath );

		// was a match found exactly at requested keypath?
		if ( found && ( child = found.child ) && found.keypath === keypath ) {
			return child;
		}

		// for a tryJoin, the first key has to exist as a prop of this model
		// TODO: is there more optimal way to get first key in relation to rest of method?
		// i.e. i = keypath.indexOf('.'); ~i ? keypath.substr( 0, i ) : keypath
		keys = ('' + keypath).split('.');
		if ( !child && testFirstKey && !this.hasChild( keypath.split('.')[0] ) ) {
			return;
		}

		if ( found && found.keypath ) {
			keypath = keypath.replace( found.keypath + '.', '' );
		}

		keys = ('' + keypath).split('.');
		key = keys.shift();

		parent = child || this;
		while ( key ) {
			child = new Model( key );
			parent.addChild( child );
			key = keys.shift();
			parent = child;
		}

		return child;
	}

	_findInCache ( keypath ) {
		var cache = this.contextCache, child, original = keypath;

		if ( !cache ) { return; }

		while ( keypath ) {
			if ( child = cache[ keypath ] ) {
				break;
			}
			keypath = keypath.substring( 0, keypath.lastIndexOf('.') );
		}

		return {
			child: child,
			keypath: keypath
		};
	}

	addChild ( child, key = child.key ) {
		var parent = child.parent = this, originalKey = key;
		child.owner = this.owner;
		this.children ? this.children.push( child ) : this.children = [ child ];

		while ( parent ) {
			if ( parent.isContext() ) {
				parent.cacheChild( key, child );
			}
			key = parent.key + '.' + key;
			parent = parent.parent;
		}

		this._notifyWatcher( originalKey );

	}

	_notifyWatcher ( key ) {
		var watcher = this._getWatcher( key ), length, i;
		if( watcher ) {
			this._doNotifyWatcher( watcher );
		}
	}

	_doNotifyWatcher ( watcher ) {
		var i = 0, length = watcher.length;
		while ( i < length ) {
			watcher[ i++ ]( this );
		}
	}

	_testWatchers () {
		var key, watchers = this.watchers;
		if( watchers ) {
			var value = this.get();
			for( key in watchers ){
				// a bit redundant wit hasChild, but don't
				// want to refetch value
				if ( hasChildFor( value, key ) ) {
					this._doNotifyWatcher( watchers[ key ] );
				}
			}
		}
	}

	_getWatcher ( key ) {
		var watchers = this.watchers;
		return watchers ?  watchers[ key ] : null;
	}

	addWatcher ( key, handler ) {
		var watchers = this.watchers || ( this.watchers = {} ),
			watcher = watchers[ key ] || ( watchers[ key ] = [] );

		addToArray( watcher, handler );
	}

	removeWatcher ( key, handler ) {
		var watcher = this._getWatcher( key );
		if( watcher ) {
			removeFromArray( watcher, handler );
		}
	}

	getKeypath () {
		var parentKey = this.parent.getKeypath();
		return parentKey ? '.' + this.key : this.key;
	}

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

	isRooted () {
		this.owner.hasModel( this.firstKey );
	}

	get ( options ) {
		return this.store.get();
	}

	hasChild ( propertyOrIndex ) {
		return hasChildFor( this.get(), propertyOrIndex );
	}

	set ( value, options ) {
		if( this.store.set( value ) ) {
			this.mark();
		}
	}

	mark ( /*options*/ ) {

		// TODO: can this be part of a ComputationModel?
		this.store.invalidate();

		this._testWatchers();

		this.cascade();

		addToArray( this.owner.changes, this );

		if ( this.owner.ready ) {
			this.owner.onchange();
		}
	}

	cascade ( cascadeUpOnly ) {
		var children, dependants, computed, i, l;

		// bail if we've already been here...
		if ( this.dirty ) { return; }

		this.dirty = true;

		// tell children, unless we're walking up the tree
		if ( !cascadeUpOnly && ( children = this.children ) ) {
			for( i = 0, l = children.length; i < l; i++ ) {
				children[i].cascade();
			}
		}

		// all the way up the tree
		if ( !this.isRoot ) {
			this.parent.cascade( true );
		}

		// mark computed dependants as changed
		if( ( dependants = this.dependants ) && ( computed = dependants.computed ) ) {
			for( i = 0, l = computed.length; i < l; i++ ) {
				computed[i].mark();
			}
		}
	}

	register ( dependant, type = 'default' ) {

		// TODO: get rid of this
		if ( dependant.isStatic ) {
			return; // TODO we should never get here if a dependant is static...
		}

		if ( !( type === 'default' || type === 'computed'  ) ) {
			this.owner.register( this, dependant, type );
		}

		if ( this.shiftNotify === type ) {
			console.log( this.str + ' attempted register during notify!', dependant );
			return;
		}

		var dependants = this.dependants || ( this.dependants = {} ), group;

		if( group = dependants[ type ] ) {
			group.push( dependant );
		}
		else {
			dependants[ type ] = [ dependant ];
		}
	}

	unregister ( dependant, type = 'default' ) {

		// TODO: get rid of this
		if ( dependant.isStatic ) {
			return; // TODO we should never get here if a dependant is static...
		}

		if ( !( type === 'default' || type === 'computed' ) ) {
			this.owner.unregister( this, dependant, type );
		}

		var dependants = this.dependants, group;

		if( dependants && ( group = this.dependants[ type ] ) ) {
			removeFromArray( group, dependant );
		}
	}

	notify ( type ) {
		var dependants, group, value, children, i, l, shift, d;

		if( !this.dirty ) { return; }

		// TODO find better way to handle this.
		// maybe seperate "flush" method
		if( type === 'default' ) { this.dirty = false; }

		if( ( dependants = this.dependants ) && ( group = dependants[ type ] ) ) {
			value = this.get();

			// TEMP to test if new registrations are happening...
			this.shiftNotify = type;

			var shift = [];
			while ( d = group.shift() ) {
				d.setValue( value );
				shift.push( d );
			}
			dependants[ type ] = shift;

			this.shiftNotify = null;
		}

		if ( children = this.children ) {
			for( i = 0, l = children.length; i < l; i++ ) {
				children[i].notify( type );
			}
		}
	}

	indexJoin ( index, aliases ) {
		return this.createStateChildren( index + '', index, index, aliases );
	}

	keyJoin ( key, index, aliases ) {
		return this.createStateChildren( key, key, index, aliases );
	}

	keyContext () {
		this.startContext();
		var key = this.getKeypath();
		this.createStateChild( key, '@keypath' );
	}

	createStateChildren ( propertyOrIndex, key, index, aliases ) {
		var child, indexAlias, keyAlias;

		child = this.join( propertyOrIndex );
		child.startContext();

		if ( aliases ) {
			keyAlias = aliases.find( ref => ref.t ==='k' );
			indexAlias = aliases.find( ref => ref.t ==='i' );
		}

		// TODO need to change for updates (rebinds)
		// need to hide actual strings and use gets
		child.createStateChild( '@keypath', child.key );
		child.createStateChild( '@key', key, keyAlias );
		child.createStateChild( '@index', index, indexAlias );

		return child;
	}

	createStateChild ( key, state, alias ) {
		var model;

		if ( !( model = this.tryGetChild( key ) ) ) {
			model = new Model( state, new StateStore( state ) );
			this.addChild( model );
		}

		if ( alias && !this.tryGetChild( key = alias.n ) ) {
			this.addChild( model, key );
		}
	}

}


function addChildKeysToCache ( cache, parent, keypath ) {
	var children = parent.children, child, childKey, i, l;

	if ( !children ) { return; }

	for( i = 0, l = children.length; i < l; i++ ) {
		child = children[i];
		childKey = keypath ? keypath + '.' + child.key : child.key;

		cache[ childKey ] = child;

		if ( !child.isContext ) {
			addChildKeysToCache( cache, child, childKey );
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
