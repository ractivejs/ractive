
import Model from '../model/Model';
import ProxyModel from '../model/ProxyModel';
import ReferenceModel from '../model/ReferenceModel';

import getExpressionSignature from '../Computation/getExpressionSignature';
import Computation from '../Computation/NewComputation';

import { ExpressionStore, StateStore } from '../model/store';

import { INTERPOLATOR, REFERENCE } from 'config/types';
import createReferenceResolver, { isSpecialResolver, isIndexResolver } from 'virtualdom/items/shared/Resolvers/createReferenceResolver';
import ExpressionResolver from 'virtualdom/items/shared/Resolvers/ExpressionResolver';
import ReferenceExpressionResolver from 'virtualdom/items/shared/Resolvers/ReferenceExpressionResolver/ReferenceExpressionResolver';

import runloop from 'global/runloop';

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
		return viewmodel.modelCache[ reference ];
	}
	else {
		return viewmodel.modelCache[ reference ] = new Model( reference, viewmodel );
	}

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

	if ( !( model instanceof ProxyModel ) && !model.owner.hasKeypath( model.str ) ) {
		model.owner.modelCache[ model.str ] = model;
	}

	return model;
}

function getReferenceModel( viewmodel, reference, context ) {
	var model = resolveRef( viewmodel.ractive, reference, context.parentFragment );

	if ( !model ) {
		model = new ProxyModel( reference, viewmodel );
		runloop.addUnresolved({
			root: viewmodel.ractive,
			ref: reference,
			model: model,
			parentFragment: context.parentFragment
		});
	}

	return model;
}

function getExpressionModel( viewmodel, reference, context ) {
	// TODO: need to lookup expressionCache first
	var store = getExpressionStore( viewmodel, reference, context ),
		str = reference.r.reduce( function ( str, ref, i ) {
			return str.replace( '_' + i, ref );
		}, reference.s),
		model = new Model( '${' + str + '}', viewmodel, store );

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

function getReferenceExpressionModel ( viewmodel, reference, context ) {
	var previous, members, member, model;

	previous = getReferenceModel( viewmodel, reference.r, context );
	members = reference.m.map( ref => getMemberModel( viewmodel, ref, context ) );

	while( member = members.shift() ) {
		model = new ReferenceModel( member, viewmodel );
		// TODO: change so parent goes in constructor!
		model.parent = previous;
		previous.addChild( model );
		model.cascade();

		previous = model;
	}

	return previous;
}

function getMemberModel( viewmodel, reference, context ){

	if ( typeof reference === 'string' ) {
		// remove string when Model can be parentless on construct
		return new Model( '"' + reference + '"', viewmodel, new StateStore( reference ) );
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
