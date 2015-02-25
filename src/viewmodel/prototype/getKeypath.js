import { Keypath, KeypathAlias } from 'shared/keypaths';

import Model from '../model/Model';

import getExpressionSignature from '../Computation/getExpressionSignature';
import Computation from '../Computation/NewComputation';

import { ExpressionStore } from '../model/store';

import { INTERPOLATOR } from 'config/types';
import createReferenceResolver, { isSpecialResolver, isIndexResolver } from 'virtualdom/items/shared/Resolvers/createReferenceResolver';
import ExpressionResolver from 'virtualdom/items/shared/Resolvers/ExpressionResolver';
import ReferenceExpressionResolver from 'virtualdom/items/shared/Resolvers/ReferenceExpressionResolver/ReferenceExpressionResolver';


import resolveRef from 'shared/resolveRef';

export default function Viewmodel$getKeypath ( reference, context, callback /* TEMP */ ) {
	var keypath;

	// don't think this is used...
	if ( reference == null ) {
		debugger; // canary
		return reference;
	}

	if ( typeof reference === 'string' ) {

		return getByString( this, reference );
	}

	return getByTemplate( this, reference, context, callback );

	debugger;

	return keypath;
}

function getByString ( viewmodel, reference ) {

	if( viewmodel.hasKeypath( reference ) ) {
		return viewmodel.keypathCache[ reference ];
	}
	else {
		return viewmodel.keypathCache[ reference ] = new Model( reference, viewmodel );
	}

}

function getByTemplate ( viewmodel, reference, context ) {

	var store, str, resolver, keypath, owner = {
		root: viewmodel.ractive,
		parentFragment: context.parentFragment
	};

	if ( reference.r ) {
		keypath = resolveRef( viewmodel.ractive, reference.r, context.parentFragment );
	}
	else if ( reference.x ) {
		keypath = getExpressionModel( viewmodel, reference.x, context );
	}
	else {
		resolver = createResolver( owner, reference, function ( resolved ) {
			if ( !keypath ) {
				keypath = resolved;
			}
			else {
				if ( keypath !== resolved && keypath.resolve ) {
					keypath.resolve( resolved );
				}
				if ( !resolved.owner.hasKeypath( resolved.str ) ) {
					// should be managed by the keypath creator
					debugger;
				}
			}
		});

		// if the owner doesn't have an entry, create it.
		// ideally this would happen consistently via the resolver
		// or it always gets added here
		if ( keypath && !keypath.owner.hasKeypath( keypath.str ) ) {
			keypath.owner.keypathCache[ keypath.str ] = keypath;
		}
	}

	if ( !keypath ) {
		keypath = new KeypathAlias( viewmodel );
	} else {
		// if the owner doesn't have an entry, create it.
		// ideally this would happen consistently via the resolver
		// or it always gets added here
		if ( !keypath.owner.hasKeypath( keypath.str ) ) {
			keypath.owner.keypathCache[ keypath.str ] = keypath;
		}
	}

	// TEMP
	if ( resolver ) {
		if ( context.resolvers ) {
			context.resolvers.push( resolver );
		} else {
			// shouldn't have mappings
			// but mustaches will go here next!

			// hmm, just guessing for now!
			context.resolver = resolver;
			// debugger;
		}
	}

	return keypath;
}

function getExpressionModel( viewmodel, reference, context ) {
	// TODO: need to lookup expressionCache first
	var store = getExpressionStore( viewmodel, reference, context ),
		str = reference.r.reduce( function ( str, ref, i ) {
			return str.replace( '_' + i, ref );
		}, reference.s),
		model = new Model( str, viewmodel, store );

	// TODO: reorder these dependencies to get around this hack
	store.computation.setModel( model );

	return model;
}

function getExpressionStore( viewmodel, reference, context ){
	var models = reference.r.map( ref => getByTemplate( viewmodel, { r: ref }, context ) ),
		signature = getExpressionSignature( reference.s, models, viewmodel.ractive ),
		computation = new NewComputation( viewmodel, signature /*, initialValue*/ );
		return new ExpressionStore( computation );

}

function isSpecial ( owner, template ) {
	var ref = template.r;

	return ref && ( isSpecialResolver( ref ) || isIndexResolver( owner, ref) );
}


function createResolver ( owner, reference, callback ) {
	var resolver;

	if ( reference.r ) {
		resolver = createReferenceResolver( owner, reference.r, callback );
	}

	else if ( reference.x ) {
		resolver = new ExpressionResolver( owner, reference.x, callback );
	}

	else if ( reference.rx ) {
		resolver = new ReferenceExpressionResolver( owner, reference.rx, callback );
	}

	return resolver;
}

