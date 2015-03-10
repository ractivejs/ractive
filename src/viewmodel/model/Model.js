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
		this.childHash = null;
		this.dependants = null;
		this.children = null;
		this.watchers = null;

		// for development debug purposes:
		// if ( true /*owner.debug*/ ) {
		// 	this.ownerName = this.owner.ractive.component ? this.owner.ractive.component.name : 'Ractive';
		// }
	}

	findChild ( key ) {
		var hash = this.childHash;
		if ( !hash ) { return; }
		return hash[ key ];
	}

	hashChild ( key, child ) {
		var hash = this.childHash || ( this.childHash = {} );
		hash[ key ] = child;
	}

	startContext ( index ) {
		this.index = index;
	}

	join ( keypath ) {
		return this._doJoin( keypath, false );
	}

	tryJoin ( keypath ) {
		return this._doJoin( keypath, true );
	}

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
							return parent.createStateChild( '@index', parent.index );
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

				child = new Model( key );
				parent.addChild( child );
			}
			parent = child;
			firstKey = false;
		}

		return child;
	}


	addChild ( child, key = child.key ) {

		if ( !child.parent ) {
			child.parent = this;
			child.owner = this.owner;
		}

		this.children ? this.children.push( child ) : this.children = [ child ];
		this.hashChild( key, child );
		this._notifyWatcher( key );
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
		var child, alias;

		child = this.join( propertyOrIndex );
		child.startContext( index );

		if ( aliases ) {
			if ( alias = aliases.find( ref => ref.t ==='k' ) ) {
				child.createStateChild( '@key', key, alias );
			}
			if ( alias = aliases.find( ref => ref.t ==='i' ) ) {
				child.createStateChild( '@index', index, alias );
			}
		}

		return child;
	}

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
