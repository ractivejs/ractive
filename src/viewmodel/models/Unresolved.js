import { addToArray, removeFromArray } from 'utils/array';
import Context from './Context';

class Unresolved extends Context {

	constructor ( key, owner ) {
		super( key, {} );
		this.owner = owner;
		this.realContext = null;
		this.forceResolve = null;

		// TODO don't need both these do we (or either)?
		this.unresolved = true;
		this.isProxy = true;
	}

	isUnresolved () {
		return !this.realContext;
	}

	addChild ( child ) {
		if ( !this.realContext ) {
			super.addChild( child );
		} else {
			this.realContext.addChild( child );
		}
	}

	resolve ( context ) {
		var properties, child, deps, dep;
		this.realContext = context;
		this.unresolved = false;
		this.forceResolve = null;

		if ( properties = this.properties ) {
			while ( child = properties.pop() ) {
				context.addChild( child );
			}
			this.properties = null;
		}

		if ( deps = this.dependants ) {
			while ( dep = deps.pop() ) {
				context.register( dep.dependant, dep.type );
				markComputedIfDirty( context, dep );
			}
			this.dependants = null;
		}

		if ( deps = this.listDependants ) {
			while ( dep = deps.pop() ) {
				context.listRegister( dep.dependant, dep.type );
				markComputedIfDirty( context, dep );
			}
			this.listDependants = null;
		}
	}

	setForceResolve( resolve ) {
		this.forceResolve = resolve;
	}

	get ( options ) {
		if ( this.realContext ) {
			return this.realContext.get( options );
		}
	}

	hasChild ( propertyOrIndex ) {
		if ( ! this.realContext ) {
			return false;
		}
		return this.realContext.hasChild( propertyOrIndex );
	}

	set ( value, options ) {
		if ( !this.realContext ) {
			this.forceResolve();
		}
		return this.realContext.set( value, options );
	}

	getSettable ( propertyOrIndex ) {
		if ( !this.realContext ) {
			this.forceResolve();
		}
		return this.realContext.getSettable ( propertyOrIndex );
	}

	getKeypath () {
		return this.realContext ? this.realContext.getKeypath() : '$unresolved.' + this.key;
	}

	mark ( /*options*/ ) {
		if ( !this.realContext ) {
			throw new Error('mark');
		}
		return this.realContext.mark();
	}

	cascade ( cascadeUpOnly ) {
		if ( !this.realContext ) {
			throw new Error('cascade');
		}
		return this.realContext.cascade( cascadeUpOnly );
	}

	register ( dependant, type = 'default' ) {

		if ( this.realContext ) {
			return this.realContext.register( dependant, type );
		}

		( this.dependants || ( this.dependants = [] ) ).push({
			type: type,
			dependant: dependant
		});
	}

	unregister ( dependant, type = 'default' ) {

		if ( this.realContext ) {
			return this.realContext.unregister( dependant, type );
		}

		var deps, dep;

		if( deps = this.dependants ) {
			if ( dep = deps.find( d => d.dependant === dependant) ) {
				removeFromArray( deps, dep );
			}
		}
	}

	listRegister ( dependant, type = 'default' ) {

		if ( this.realContext ) {
			return this.realContext.listRegister( dependant, type );
		}

		( this.listDependants || ( this.listDependants = [] ) ).push({
			type: type,
			dependant: dependant
		});
	}

	listUnregister ( dependant, type = 'default' ) {

		if ( this.realContext ) {
			return this.realContext.listUnregister( dependant, type );
		}

		var deps, dep;

		if( deps = this.listDependants ) {
			if ( dep = deps.find( d => d.dependant === dependant) ) {
				removeFromArray( deps, dep );
			}
		}
	}

	notify ( type ) {
		if ( !this.realContext ) {
			throw new Error('notify called on Unresolved');
		}
		this.realContext.notify( type );
	}

	join ( keypath ) {
		if ( this.realContext ) {
			return this.realContext.join( keypath );
		}
		return super.join( keypath );
	}
}

function markComputedIfDirty ( context, dep ) {
	if ( context.dirty && dep.type === 'computed' ) {
		dep.dependant.mark();
	}
}

export default Unresolved;
