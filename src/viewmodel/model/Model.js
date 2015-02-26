import { isArray, isNumeric } from 'utils/is';
import { addToArray, removeFromArray } from 'utils/array';
import { isEqual } from 'utils/is';
import createBranch from 'utils/createBranch';
import getPotentialWildcardMatches from 'utils/getPotentialWildcardMatches';

import { DataStore, PropertyStore, StateStore } from './store';


var FAILED_LOOKUP = {};

var refPattern, modelCache, Keypath;

refPattern = /\[\s*(\*|[0-9]|[1-9][0-9]+)\s*\]/g;

modelCache = {};

class Model {
	constructor ( str, owner, store ) {
		var parent, keys = str.split( '.' );

		this.str = str;
		this.firstKey = keys[0];
		this.lastKey = keys.pop();

		this.dirty = false;

		this.dependants = null;
		this.children = null;

		this.parent = parent = ( this.isRoot = !str ) ? null : owner.getKeypath( keys.join( '.' ) );
		if ( parent ) {
			owner = parent.owner;
			parent.addChild( this );
		}


		this.store = store || ( this.isRoot ? new DataStore( owner.data ) : new PropertyStore( parent, this.lastKey ) );

		this.owner = owner;

		// for development debug purposes:
		if ( true /*owner.debug*/ ) {
			this.ownerName = owner.ractive.component ? owner.ractive.component.name : 'Ractive';
		}
	}

	addChild ( child ) {
		this.children ? this.children.push( child ) : this.children = [ child ];
	}

	isRooted () {
		this.owner.hasKeypath( this.firstKey );
	}

	get ( options ) {
		return this.store.get();
	}

	hasChild ( propertyOrIndex ) {
		return hasChildFor( this.store.get(), propertyOrIndex );
	}

	set ( value, options ) {
		if( this.store.set( value ) ) {
			this.mark();
		}
	}

	mark ( /*options*/ ) {

		this.cascade();

		addToArray( this.owner.changes, this );

		if ( this.owner.ready ) {
			this.owner.onchange();
		}
	}

	cascade ( cascadeUpOnly ) {
		var children, dependants, computed, i;

		// bail if we've already been here...
		if ( this.dirty ) { return; }

		this.dirty = true;

		// tell children, unless we're walking up the tree
		if ( !cascadeUpOnly && ( children = this.children ) ) {
			i = children.length;
			while ( i-- ) {
				children[i].cascade();
			}
		}

		// all the way up the tree
		if ( !this.isRoot ) {
			this.parent.cascade( true );
		}

		// mark computed dependants as changed
		if( ( dependants = this.dependants ) && ( computed = dependants.computed ) ) {
			i = computed.length;
			while ( i-- ) {
				// TODO: this is odd place to invalidate computation
				computed[i].store.reset();
				computed[i].mark();
			}
		}
	}

	register ( dependant, type = 'default' ) {

		// TODO: get rid of this
		if ( dependant.isStatic ) {
			return; // TODO we should never get here if a dependant is static...
		}

		if ( !( type === 'default' || type === 'computed' ) ) {
			this.owner.register( this, dependant, type );
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
		var dependants, group, value, children, i;

		if( !this.dirty ) { return; }

		// TODO find better way to handle this.
		// maybe seperate "flush" method
		if( type === 'default' ) { this.dirty = false; }

		if( ( dependants = this.dependants ) && ( group = dependants[ type ] ) ) {
			value = this.get();
			i = group.length;
			while ( i-- ) {
				group[i].setValue( value );
			}
		}

		if ( children = this.children ) {
			i = children.length;
			while ( i-- ) {
				children[i].notify( type );
			}
		}
	}


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
		return this.owner.getKeypath( str );
	}

	indexJoin ( index, aliases ) {
		return this.createStateChildren( index, index, index, aliases );
	}

	keyJoin ( key, index, aliases ) {
		return this.createStateChildren( key, key, index, aliases );
	}

	createStateChildren ( propertyOrIndex, key, index, aliases ) {
		var childKey = this.str + '.' + propertyOrIndex, child, indexAlias, keyAlias;

		if ( this.owner.hasKeypath( childKey ) ) {
			return;
		}

		child = this.owner.getKeypath( childKey );

		if ( aliases ) {
			keyAlias = aliases.find( ref => ref.t ==='k' );
			indexAlias = aliases.find( ref => ref.t ==='i' );
		}

		// TODO need to change for updates (rebinds)
		// need to hide actual strings and use gets
		this.createStateChild( child.str, '@keypath', child.str );
		this.createStateChild( child.str, '@key', key, keyAlias );
		this.createStateChild( child.str, '@index', index, indexAlias );

		return child;
	}

	createStateChild ( parentKey, special, state, alias ) {
		var key = parentKey + '.' + special,
			model = new Model( key, this.owner, new StateStore( state ) );

		this.owner.modelCache[ key ] = model;

		if ( alias ) {
			this.owner.modelCache[ parentKey + '.' + alias.n ] = model;
		}
	}

}

function hasChildFor ( value, key ) {
	if ( value == null ) {
		return false;
	}
	if ( ( typeof value === 'object' || typeof value === 'function' ) && !( key in value ) ) {
		return false;
	}
	return true;
}

export default Model;
