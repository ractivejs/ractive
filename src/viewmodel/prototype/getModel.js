import Model from '../models/Model';
import ReferenceModel from '../models/ReferenceModel';
import ComputationModel from '../models/ComputationModel';
import getInnerContext from 'shared/getInnerContext';
import getExpressionSignature from '../Computation/getExpressionSignature';
import StateStore from '../stores/StateStore';
import { INTERPOLATOR, REFERENCE } from 'config/types';
import runloop from 'global/runloop';
import resolveRef from 'shared/resolveRef';

export default function Viewmodel$getModel ( reference, context ) {
	var keypath;

	// don't think this is used...
	if ( reference == null ) {
		throw new Error( 'no reference!' );
	}

	if ( typeof reference === 'string' ) {
		return getByString( this, reference );
	}

	return getByTemplate( this, reference, context );


}

function getByString ( viewmodel, keypath ) {

	if ( !keypath ) {
		return viewmodel.root;
	}

	return viewmodel.root.join( keypath );
}

function getByTemplate ( viewmodel, reference, context ) {

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
		model = new ReferenceModel( member.fullKey || member.model.key, member.model, previous );
		previous.addChild( model );
		previous = model;
	}

	return previous;
}

function getMemberModel( viewmodel, reference, context ){

	if ( typeof reference === 'string' ) {
		return {
			model: new Model( "' + reference + '", new StateStore( reference ) )
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
