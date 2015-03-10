
import Model from '../model/Model';
import ProxyModel from '../model/ProxyModel';
import ReferenceModel from '../model/ReferenceModel';

import getInnerContext from 'shared/getInnerContext';
import getExpressionSignature from '../Computation/getExpressionSignature';
import Computation from '../Computation/NewComputation';

import { ExpressionStore, StateStore } from '../model/store';

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
	var key, store, model;


	key = '${' + reference.r.reduce( function ( str, ref, i ) {
			return str.replace( '_' + i, ref );
		}, reference.s) + '}';

	// TODO: explore caching of expression by context.
	// What if itermediate innerContext gets created?
	// if ( model = viewmodel.getExpression( key ) ) {
	// 	return model;
	// }

	store = getExpressionStore( viewmodel, reference, context ),
	model = new Model( key, store );
	// TODO: reorder these dependencies to get around this hack
	store.computation.setModel( model );

	viewmodel.root.addChild( model );

	return model;
}

function getExpressionStore( viewmodel, reference, context ){
	var models = reference.r.map( ref => getByTemplate( viewmodel, { r: ref }, context ) ),
		signature = getExpressionSignature( reference.s, models, viewmodel.ractive ),
		computation = new NewComputation( viewmodel, signature /**/ );
		return new ExpressionStore( computation );

}

function getReferenceExpressionModel ( viewmodel, reference, context ) {
	var previous, members, member, model;

	previous = getReferenceModel( viewmodel, reference.r, context );
	members = reference.m.map( ref => getMemberModel( viewmodel, ref, context ) );

	while( member = members.shift() ) {
		model = new ReferenceModel( member, previous );
		previous.addChild( model );
		previous = model;
	}

	return previous;
}

function getMemberModel( viewmodel, reference, context ){

	if ( typeof reference === 'string' ) {
		// remove string when Model can be parentless on construct
		return new Model( '"' + reference + '"', new StateStore( reference ) );
	}

	// Simple reference?
	else if ( reference.t === REFERENCE ) {
		return getReferenceModel( viewmodel, reference.n, context );
	}

	// Otherwise we have an expression in its own right
	else {
		return getExpressionModel( viewmodel, reference, context );
	}
}
