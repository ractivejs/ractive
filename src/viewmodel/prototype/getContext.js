import BindingContext from '../context/BindingContext';
import DynamicContextReference from '../context/DynamicContextReference';
import ComputedContext from '../context/ComputedContext';
import StateStore from '../stores/StateStore';
import { REFERENCE } from 'config/types';
import resolveRef from 'shared/resolveRef';

import getInnerContext from 'shared/getInnerContext';

// TODO: this functionality needs to move the virtualdom
import getExpressionSignature from 'virtualdom/items/shared/Mustache/getExpressionSignature';

// TODO getContext -> getContext? YEP!
export default function Viewmodel$getContext ( keypath ) {

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
	const bindingContext = getInnerContext( context.parentFragment ),
		  key = '${' + reference.r.reduce( ( str, ref, i ) => {
		      return str.replace( '_' + i, ref );
		  }, reference.s) + '}';

	let model = null;


	// Two expressions are equal _if_ they have the same key
	// and occur at the same context
	if ( bindingContext.expressions ) {
		if ( bindingContext.expressions.hasOwnProperty( key ) ) {
			model = bindingContext.expressions[ key ];
		}
	}
	else {
		bindingContext.expressions = {}; // Object.create(null) ???
	}

	if ( !model ) {
		const models = reference.r.map( ref => getByTemplate( viewmodel, { r: ref }, context ) ),
			  signature = getExpressionSignature( reference.s, models, viewmodel.ractive );

		model = new ComputedContext( key, signature );
		// Expressions are stored on root because cascades are
		// they are not directly dependent on immediate context
		// but to their dependencies (which are context dependent).
		viewmodel.root.addChild( model );
		bindingContext.expressions[ key ] = model;
	}
	return model;
}


function getReferenceExpressionModel ( viewmodel, reference, context ) {
	var previous, members, member, model;

	previous = getReferenceModel( viewmodel, reference.r, context );
	members = reference.m.map( ref => getMemberModel( viewmodel, ref, context ) );

	while( member = members.shift() ) {
		model = new DynamicContextReference( member.fullKey || member.model.key, member.model, previous );
		previous.addChild( model );
		previous = model;
	}

	return previous;
}

function getMemberModel( viewmodel, reference, context ){

	if ( typeof reference === 'string' ) {
		return {
			model: new BindingContext( "'" + reference + "'", new StateStore( reference ) )
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
