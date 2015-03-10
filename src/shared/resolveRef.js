import { normalise } from 'shared/keypaths';
import ProxyModel from 'viewmodel/model/ProxyModel';
import getInnerContext from 'shared/getInnerContext';

export default function resolveRef ( ractive, ref, fragment ) {
	var keypath, viewmodel = ractive.viewmodel;

	ref = normalise( ref );

	// If a reference begins '~/', it's a top-level reference
	if ( ref.substr( 0, 2 ) === '~/' ) {
		// TODO: recursive fail!
		keypath = viewmodel.root.join( ref.substring( 2 ) );
	}

	// If a reference begins with '.', it's either a restricted reference or
	// an ancestor reference...
	else if ( ref[0] === '.' ) {
		keypath = resolveAncestorRef( getInnerContext( fragment ), ref );
	}

	// ...otherwise we need to figure out the keypath based on context
	else {
		keypath = resolveAmbiguousReference( ractive.viewmodel, ref, fragment, false );
	}

	return keypath;
}

function resolveAncestorRef ( context, ref ) {

	var isAncestor = false;

	// legacy, need to find when this happens...
	if( !context ) {
		throw new Error('no base context');
		// return;
	}

	// {{.}} means 'current context'
    if ( ref === '.' ) { return context; }

	// ancestor references (starting "../") go up the tree
	while ( ref.substr( 0, 3 ) === '../' ) {
		if ( context.isRoot ) {
			throw new Error( 'Could not resolve reference - too many "../" prefixes' );
		}
		isAncestor = true;
		context = context.parent;
		ref = ref.substring( 3 );
	}

	// not an ancestor reference must be a restricted reference,
	// prepended with "." or "./", which needs to be removed
    if ( !isAncestor ) {
    	ref = ref.replace( /^\.\/?/, '' );
    }

	return context.join( ref );
}

function resolveAmbiguousReference ( viewmodel, keypath, fragment ) {
	var stack = getContextStack( fragment ), chain, context, model,
		// temp until figure out bcuz logic already in keypath
		firstKey = keypath.split( '.' )[0];


	// We have to try the context stack from the bottom up.
	// Closer contexts have precedence.
	// TODO: choose pseudo iterator API. This is based on ES6 generator.
	for ( var _iterator = stack/*[Symbol.iterator]*/(), _step; !(_step = _iterator.next()).done; ) {
		context = _step.value;
		chain = {
            current: context,
            previous: chain
        };

		if ( model = context.tryJoin( keypath ) ) {
			return model;
		}
	}

	// Return a proxy model and watch for new children to be added
	if ( chain ) {
		return getProxyModel( chain, firstKey, keypath, viewmodel );
    }
	// If there's no context chain, and the instance is either a) isolated or
	// b) an orphan, then we know that the keypath is identical to the keypath
	else {
		// the data object needs to have a property by this name,
		// to prevent future failed lookups
		model = viewmodel.root.join( keypath );

		// TODO: Still necessary???
		viewmodel.set( model, undefined );

		return model;
	}
}

function getProxyModel ( chain, key, keypath, viewmodel ) {
	var watchers = [], proxy, resolve, context;

	// TODO: need to handle mulit-part proxy for full keypath, "foo.bar.qux"
	proxy = new ProxyModel( key, viewmodel );

	resolve = function ( context ) {
		proxy.resolve( context.join( proxy.key ) );

		while(chain){
	        context = chain.current;
	        chain = chain.previous;
	        context.removeWatcher( key, resolve );
	    }
	}

	while(chain){
        context = chain.current;
        chain = chain.previous;
        context.addWatcher( key, resolve );
    }

    return proxy;
}

function getContextStack ( fragment ){

	return function iterator () {
		var nextFragment, root, iterator;

		function assignFragment ( fragment ) {
			nextFragment = fragment;
			root = fragment.root;
		}


		function getNextContext() {
			var context;

			while ( !context && nextFragment ) {
				context = nextFragment.context;
				nextFragment = nextFragment.parent;
			}

			return context;
		}

		function getRoot(){
			var context;
			if ( !root ) { return; }

			context = root.viewmodel.root;

			if ( root.parent && !root.isolated ) {
				iterator.hasContextChain = true;
				assignFragment( root.component.parentFragment );
			}
			else {
				root = null;
			}

			return context;
		}

		assignFragment( fragment );

		iterator = {
			next () {
				var value = getNextContext() || getRoot();
				return {
					value: value,
					done: !value
				};
			}
		};

		return iterator;
	};
}
