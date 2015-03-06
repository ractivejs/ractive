import { normalise } from 'shared/keypaths';
import getInnerContext from 'shared/getInnerContext';

export default function resolveRef ( ractive, ref, fragment, noUnresolved ) {
	var keypath, viewmodel = ractive.viewmodel;

	ref = normalise( ref );

	// If a reference begins '~/', it's a top-level reference
	if ( ref.substr( 0, 2 ) === '~/' ) {
		// TODO: recursive fail!
		keypath = viewmodel.rootKeypath.getChild( ref.substring( 2 ) );
	}

	// If a reference begins with '.', it's either a restricted reference or
	// an ancestor reference...
	else if ( ref[0] === '.' ) {
		keypath = resolveAncestorRef( getInnerContext( fragment ), ref );
	}

	// ...otherwise we need to figure out the keypath based on context
	else {
		keypath = resolveAmbiguousReference( ractive, ref, fragment, false, noUnresolved );
	}

	if ( keypath && noUnresolved && keypath.unresolved ) {
		return;
	}

	return keypath;
}

function resolveAncestorRef ( baseContext, ref ) {

	// the way KeypathExpression are currently handled, context can
	// be null because there's no corresponding keypath.
	// But now it really it doesn't work because context might be above that and not the root
	//
	// When we have Dedicated Keypath for those,
	// should iron that out
	if( !baseContext ) { return; }

	// {{.}} means 'current context'
    if ( ref === '.' ) { return baseContext; }

	// ancestor references (starting "../") go up the tree
	if ( ref.substr( 0, 3 ) === '../' ) {

		while ( ref.substr( 0, 3 ) === '../' ) {
			if ( baseContext.isRoot ) {
				throw new Error( 'Could not resolve reference - too many "../" prefixes' );
			}

			baseContext = baseContext.parent;
			ref = ref.substring( 3 );
		}

        return baseContext.join( ref );
    }

	// not an ancestor reference
	// must be a restricted reference (prepended with "." or "./")
	// which needs to be removed
	return baseContext.join( ref.replace( /^\.\/?/, '' ) );
}

function resolveAmbiguousReference ( ractive, keypath /* string */, fragment, isParentLookup, noUnresolved ) {
	var
		keys,
		firstKey,
		context,
		hasContextChain,
		parentModel,
		model,
		testKey,
		viewmodel = ractive.viewmodel;


	// temp until figure out bcuz logic already in keypath
	keys = keypath.split( '.' ),
	firstKey = keys.shift();


	var stack = getContextStack( fragment );

	// We have to try the context stack from the bottom up.
	// Closer contexts have precedence.
	for ( var _iterator = stack/*[Symbol.iterator]*/(), _step; !(_step = _iterator.next()).done; ) {
		context = _step.value;
		hasContextChain = true;

		if ( model = context.tryJoin( keypath ) ) {
			return model;
		}
	}

/*
	throw new Error('unexpected unresolved');
	// this block is some core logic about finding keypaths amongst existing
	// keypath trees and viewmodels

	// Now that we've tried the context stack (or maybe not),
	// Let's just see if the keypath is in the cache as-is
	if ( model = viewmodel.tryGetModel( keypath ) ) {
		return model;
	}

	// A variation on get Model From Context, from the Root of this instance
	if ( model = getModelFromRoot( viewmodel, keypath, firstKey, keys ) ) {
		return model;
	}

	// If this is an inline component, and it's not isolated, we
	// can try going up the scope chain
	if ( ractive.parent && !ractive.isolated ) {
		hasContextChain = true;
		fragment = ractive.component.parentFragment;

		if ( parentModel = resolveAmbiguousReference( ractive.parent, firstKey, fragment, true, noUnresolved ) ) {
			viewmodel.modelCache[ firstKey ] = parentModel;
			return viewmodel.getModel( keypath );
		}
	}
*/

	// If there's no context chain, and the instance is either a) isolated or
	// b) an orphan, then we know that the keypath is identical to the keypath
	if ( !hasContextChain ) {
		// the data object needs to have a property by this name,
		// to prevent future failed lookups
		model = viewmodel.getModel( keypath );

		// TODO: Still necessary???
		viewmodel.set( model, undefined );

		return model;
	}
}

function getModelFromContext ( viewmodel, context, keypath, firstKey ) {

	var model, testKey = context.getKeypath() + '.' + keypath;

	// Is the context + keypath already a cached model?
	// context "foo", keypath: "bar.qux" and "foo.bar.qux" cached
	//
	// We use context.owner because if "foo" is really a local
	// alias for this model in another viewmodel, say "rum.bah",
	// then we look for "rum.bah.bar.qux" in that viewmodel
	if ( model = context.owner.tryGetModel( testKey ) ) {
		return model;
	}

	// As long as the context model has a property that matches,
	// "foo" has a "bar" property, join and create the new model
	if ( context.hasChild( firstKey ) ) {
		// this create itermediate children, using purely
		// the relative keypaths of the owner viewmodel
		return context.join( keypath );
	}

	// TODO: no local cache entry is being made at correct path
	// we don't really know local alias if context.owner is different
}

function getModelFromRoot ( viewmodel, keypath, firstKey, remainingKeys ) {
	var parentModel = viewmodel.tryGetModel( firstKey ),
		model, testKey, endPath;

	endPath = remainingKeys.join('.');

	if ( !parentModel ) {
		if ( viewmodel.rootKeypath.hasChild( firstKey ) ) {
			return viewmodel.getModel( firstKey + endPath );
		}
		return;
	}


	// this model may already exists as a child over in the other viewmodel
	testKey = parentModel.getKeypath() + endPath;

	if ( model = parentModel.owner.tryGetModel( testKey ) ) {
		// ok, just check owner below before returning
	}
	else {
		model = parentModel.join( endPath );
	}

	// TODO need to add parent keys in keypath
		// We found the parent via this viewmodel, but it may actually
	// belong to another parent viewmodel. Check if same owner
	viewmodel.modelCache[ keypath ] = model;

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

			context = root.viewmodel.rootKeypath;

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

function isRootProperty ( viewmodel, key ) {
	// special case for reference to root
	return key === ''
		|| viewmodel.hasModel( key )
		|| viewmodel.rootKeypath.hasChild( key );

}
