import { addToArray, removeFromArray } from 'utils/array';
import BindingContext from './BindingContext';

class UnresolvedContext extends BindingContext {

	constructor ( key, owner ) {
		super( key, {} );
		this.owner = owner;
		this.realContext = null;
		this.forceResolve = null;
	}

	addChild ( child ) {
		if ( this.realContext ) {
			return this.realContext.addChild( child );
		}

		super.addChild( child );
	}

	_transferDependants ( method ) {

	}

	resolve ( context ) {
		this.realContext = context;
		this.forceResolve = null;

		const properties = this.properties;

		if ( properties ) {
			for( let i = 0, l = properties.length; i < l; i++ ) {
				context.addChild( properties[i] );
			}
			this.properties = null;
			this.propertyHash = null;
		}

		const dependants = this.dependants,
			  isDirty = context.dirty;

		if ( dependants ) {
			const methods = dependants.keys();
			let method, list;

			for( let m = 0, ml = methods.length; m < ml; m++ ) {
				method = methods[m];
				list = dependants.list( method );

				for( let i = 0, l = list.length; i < l; i++ ) {
					context.register( method, list[i] );
				}
			}

			// As resolution of UnresolvedContext may
			// happen after dependants have been called,
			// we need to mark() them here if resolved
			// context is already dirty.
			if ( context.dirty ) {
				dependants.notify( 'mark' );
			}

			this.dependants = null;
		}

	}

	setForceResolve( resolve ) {
		this.forceResolve = resolve;
	}

	get () {
		if ( this.realContext ) {
			return this.realContext.get();
		}
	}

	hasChild ( propertyOrIndex ) {
		if ( this.realContext ) {
			return this.realContext.hasChild( propertyOrIndex );
		}
		return false;
	}

	set ( value ) {
		if ( !this.realContext ) {
			this.forceResolve();
		}
		return this.realContext.set( value );
	}

	getSettable ( propertyOrIndex ) {
		if ( !this.realContext ) {
			this.forceResolve();
		}
		return this.realContext.getSettable ( propertyOrIndex );
	}

	getKeypath () {
		return this.realContext ? this.realContext.getKeypath() : this.key;
	}

	mark () {
		if ( !this.realContext ) {
			throw new Error('mark called on UnresolvedContext');
		}
		return this.realContext.mark();
	}

	cascade ( cascadeUpOnly ) {
		if ( !this.realContext ) {
			throw new Error('cascade called on UnresolvedContext');
		}
		return this.realContext.cascade( cascadeUpOnly );
	}

	register ( method, handler ) {
		if ( this.realContext ) {
			// TODO: observers should not fire here
			return this.realContext.register( method, handler );
		}
		super.register( method, handler );
	}


	unregister ( method, handler ) {
		if ( this.realContext ) {
			return this.realContext.unregister( method, handler );
		}
		super.unregister( method, handler );
	}

	notify () {
		if ( !this.realContext ) {
			throw new Error('notify called on UnresolvedContext');
		}
		this.realContext.notify();
	}

	join ( keypath ) {
		if ( this.realContext ) {
			return this.realContext.join( keypath );
		}
		return super.join( keypath );
	}
}

export default UnresolvedContext;
