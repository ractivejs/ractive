import Context from '../models/Context';
import DynamicReference from '../models/DynamicReference';
import ComputationModel from '../models/ComputationModel';
import getExpressionSignature from '../Computation/getExpressionSignature';
import StateStore from '../stores/StateStore';
import { REFERENCE } from 'config/types';
import resolveRef from 'shared/resolveRef';

// TODO getModel -> getContext? YEP!
export default function Viewmodel$getModel ( keypath ) {

	if ( keypath == null || keypath === '' ) {
 		return this.root;
 	}

 	// TODO: stop-gap until contextStack goes into fragments
 	var context = {
 		parentFragment: this.ractive.fragment || { root: this.ractive }
 	};

 	return getReferenceModel( this, keypath, context);
}

// TEMP export this so mustache can use it
export function getByTemplate ( viewmodel, reference, context ) {

	var model;

	if ( reference.r ) {
		model = getReferenceModel( viewmodel, reference.r, context );
	}

	else if ( reference.x ) {
		model = getExpressionModel( viewmodel, reference.x, context );
	}

	else if ( reference.rx ) {
		model = getReferenceExpressionModel( viewmodel, reference.rx, context );
	}

	return model;
}

function getReferenceModel( viewmodel, reference, context ) {
	return resolveRef( viewmodel.ractive, reference, context.parentFragment );
}

function getExpressionModel( viewmodel, reference, context ) {
	var key, models, signature, model;

	key = '${' + reference.r.reduce( function ( str, ref, i ) {
			return str.replace( '_' + i, ref );
		}, reference.s) + '}';

	// TODO: explore caching of expression by context.
	// What if itermediate innerContext gets created?
	// if ( model = viewmodel.getExpression( key ) ) {
	// 	return model;
	// }

	models = reference.r.map( ref => getByTemplate( viewmodel, { r: ref }, context ) );
	signature = getExpressionSignature( reference.s, models, viewmodel.ractive );
	model = new ComputationModel( key, signature, viewmodel );

	viewmodel.root.addChild( model );

	return model;
}


function getReferenceExpressionModel ( viewmodel, reference, context ) {
	var previous, members, member, model;

	previous = getReferenceModel( viewmodel, reference.r, context );
	members = reference.m.map( ref => getMemberModel( viewmodel, ref, context ) );

	while( member = members.shift() ) {
		model = new DynamicReference( member.fullKey || member.model.key, member.model, previous );
		previous.addChild( model );
		previous = model;
	}

	return previous;
}

function getMemberModel( viewmodel, reference, context ){

	if ( typeof reference === 'string' ) {
		return {
			model: new Context( "' + reference + '", new StateStore( reference ) )
		};
	}

	// Simple reference?
	else if ( reference.t === REFERENCE ) {
		return {
			model: getReferenceModel( viewmodel, reference.n, context ),
			fullKey: reference.n
		};
	}

	// Otherwise we have an expression in its own right
	else {
		return {
			model: getExpressionModel( viewmodel, reference, context )
		}
	}
}
