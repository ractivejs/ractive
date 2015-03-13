import { addToArray, removeFromArray } from 'utils/array';
import Model from './Model';

class ProxyModel extends Model {

	constructor ( key, owner ) {
		super( key, {} );
		this.owner = owner;
		this.realModel = null;
		this.forceResolve = null;

		// TODO don't need both these do we (or either)?
		this.unresolved = true;
		this.isProxy = true;
	}

	isUnresolved () {
		return !this.realModel;
	}

	addChild ( child ) {
		if ( !this.realModel ) {
			super( child );
		} else {
			this.realModel.addChild( child );
		}
	}

	resolve ( model ) {
		var children, child, deps, dep;
		this.realModel = model;
		this.unresolved = false;
		this.forceResolve = null;

		if ( children = this.children ) {
			while ( child = children.pop() ) {
				model.addChild( child );
			}
			this.children = null;
		}

		if ( deps = this.dependants ) {
			while ( dep = deps.pop() ) {
				model.register( dep.dependant, dep.type );
			}
			this.dependants = null;

			// note to self: removed because causes resolution too early in "addChild" case
			// model.mark();
		}
	}

	setForceResolve( resolve ) {
		this.forceResolve = resolve;
	}

	get ( options ) {
		if ( this.realModel ) {
			return this.realModel.get( options );
		}
	}

	hasChild ( propertyOrIndex ) {
		if ( ! this.realModel ) {
			return false;
		}
		return this.realModel.hasChild( propertyOrIndex );
	}

	set ( value, options ) {
		if ( !this.realModel ) {
			this.forceResolve();
		}
		return this.realModel.set( value, options );
	}

	getSettable ( propertyOrIndex ) {
		if ( !this.realModel ) {
			// TODO: see if this works
			throw new Error( 'getSettable on unresolved ProxyModel' );
			this.forceResolve();
		}
		return this.realModel.getSettable ( propertyOrIndex );
	}

	getKeypath () {
		return '$unresolved.' + this.key;
	}

	mark ( /*options*/ ) {
		if ( !this.realModel ) {
			throw new Error('mark');
		}
		return this.realModel.mark();
	}

	cascade ( cascadeUpOnly ) {
		if ( !this.realModel ) {
			throw new Error('cascade');
		}
		return this.realModel.cascade( cascadeUpOnly );
	}

	register ( dependant, type = 'default' ) {

		if ( this.realModel ) {
			return this.realModel.register( dependant, type );
		}

		( this.dependants || ( this.dependants = [] ) ).push({
			type: type,
			dependant: dependant
		});
	}

	unregister ( dependant, type = 'default' ) {

		if ( this.realModel ) {
			return this.realModel.unregister( dependant, type );
		}

		var deps, dep;

		if( deps = this.dependants ) {
			if ( dep = deps.find( d => d.dependant === dependant) ) {
				removeFromArray( deps, dep );
			}
		}
	}

	notify ( type ) {
		if ( !this.realModel ) {
			throw new Error('notify');
		}
		this.realModel.notify( type );
	}


	join ( str ) {
		if ( this.realModel ) {
			return this.realModel.join( str );
		}
	}

	indexJoin ( index, aliases ) {
		if ( !this.realModel ) {
			throw new Error('indexJoin');
		}
		return this.realModel.indexJoin ( index, aliases );
	}

	keyJoin ( key, index, aliases ) {
		if ( !this.realModel ) {
			throw new Error('keyJoin');
		}
		return this.realModel.keyJoin ( key, index, aliases );
	}

}

export default ProxyModel;
