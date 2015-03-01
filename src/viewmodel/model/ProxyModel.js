import { addToArray, removeFromArray } from 'utils/array';
import Model from './Model';

class ProxyModel extends Model {
	constructor ( key, owner ) {
		this.owner = owner;
		super( key, {} );
		this.realModel = null;
	}

	addChild ( child ) {
		if ( !this.realModel ) {
			throw new Error('addChild');
		}
		this.realModel.addChild( child );
	}

	resolve ( model ) {
		var deps, dep, i;
		this.realModel = model;
		this.unresolved = false;

		if ( deps = this.dependants ) {
			i = deps.length;
			while ( i-- ) {
				dep = deps[i];
				model.register( dep.dependant, dep.type );
			}
			this.deps = null;

			// make sure these dependants get notified
			model.mark();
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
		if ( !this.realModel ) {
			throw new Error('join');
		}
		return this.realModel.join( str );
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
