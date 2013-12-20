define([
	'utils/warn',
	'render/DomFragment/Element/shared/executeTransition/Transition'
], function (
	warn,
	Transition
) {

	'use strict';

	return function ( descriptor, root, owner, contextStack, isIntro ) {
		var transition,
			node,
			oldTransition;

		if ( !root.transitionsEnabled ) {
			return;
		}

		// get transition name, args and function
		transition = new Transition( descriptor, root, owner, contextStack, isIntro );

		if ( transition._fn ) {
			node = transition.node;
			transition._manager = root._transitionManager;

			// Existing transition (i.e. we're outroing before intro is complete)?
			// End it prematurely
			if ( oldTransition = node._ractive.transition ) {
				oldTransition.complete();
			}

			node._ractive.transition = transition;

			transition._manager.push( node );

			if ( isIntro ) {
				// we don't want to call the transition function until this node
				// exists on the DOM
				root._deferred.transitions.push( transition );
			} else {
				transition.init();
			}
		}
	};

});