import { addToArray, removeFromArray } from 'utils/array';
import Model from './Model';

class ProxyModel extends Model {
	constructor ( key, owner ) {
		this.owner = owner;
		super( key, {} );
		this.realModel = null;
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
		var children, child, deps, dep, i;
		this.realModel = model;
		this.unresolved = false;

		if ( children = this.children ) {
			i = children.length;
			while ( i-- ) {
				child = children[ i ];
				model.addChild( child );
			}
		}

		if ( deps = this.dependants ) {
			i = deps.length;
			while ( i-- ) {
				dep = deps[i];
				model.register( dep.dependant, dep.type );
			}
			this.deps = null;

			// remove because causes resolution too early in "addChild" case
			// model.mark();
		}
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
		// TODO force resolution?
		if ( this.realModel ) {
			return this.realModel.set( value, options );
		} else {
			debugger;
		}
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
		throw new Error('cascade');
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

		throw new Error('notify');
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
