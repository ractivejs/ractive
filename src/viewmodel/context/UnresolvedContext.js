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

	resolve ( context ) {
		var properties, computed, observers, views, listViews;

		this.realContext = context;
		this.forceResolve = null;

		if ( properties = this.properties ) {
			for( let i = 0, l = properties.length; i < l; i++ ) {
				context.addChild( properties[i] );
			}
			this.properties = null;
			this.propertyHash = null;
		}

		if ( computed = this.computed ) {
			for( let i = 0, l = computed.length; i < l; i++ ) {
				context.registerComputed( computed[i] );
				// As resolution of UnresolvedContext may
				// happen after computed dependancies have been called,
				// we need to mark() them here if resolved context is dirty.
				if ( context.dirty ) {
					computed[i].mark();
				}
			}
			this.computed = null;
		}

		if ( observers = this.observers ) {
			for( let i = 0, l = observers.length; i < l; i++ ) {
				context.registerObserver( observers[i] );
			}
			this.observers = null;
		}

		if ( views = this.views ) {
			for( let i = 0, l = views.length; i < l; i++ ) {
				context.registerView( views[i] );
			}
			this.views = null;
		}

		if ( listViews = this.listViews ) {
			for( let i = 0, l = listViews.length; i < l; i++ ) {
				context.registerListView( listViews[i] );
			}
			this.listViews = null;
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

	registerComputed ( computed ) {
		if ( this.realContext ) {
			return this.realContext.registerComputed( computed );
		}
		super.registerComputed( computed );
	}

	registerObserver ( observer ) {
		if ( this.realContext ) {
			return this.realContext.registerObserver( observer, true );
		}
		super.registerObserver( observer );
	}

	registerView ( view ) {
		if ( this.realContext ) {
			return this.realContext.registerView( view );
		}
		super.registerView( view );
	}

	registerListView ( view ) {
		if ( this.realContext ) {
			return this.realContext.registerListView( view );
		}
		super.registerListView( view );
	}

	unregisterComputed ( computed ) {
		if ( this.realContext ) {
			return this.realContext.unregisterComputed( computed );
		}
		super.unregisterComputed( computed );
	}

	unregisterObserver ( observer ) {
		if ( this.realContext ) {
			return this.realContext.unregisterObserver( observer );
		}
		super.unregisterObserver( observer );
	}

	unregisterView ( view ) {
		if ( this.realContext ) {
			return this.realContext.unregisterView( view );
		}
		super.unregisterView( view );
	}

	unregisterListView ( view ) {
		if ( this.realContext ) {
			return this.realContext.unregisterListView( view );
		}
		super.unregisterListView( view );
	}

	notify ( type ) {
		if ( !this.realContext ) {
			throw new Error('notify called on UnresolvedContext');
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

export default UnresolvedContext;
