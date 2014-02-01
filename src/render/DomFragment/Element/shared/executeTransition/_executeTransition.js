define([
	'state/scheduler',
	'utils/warn',
	'render/DomFragment/Element/shared/executeTransition/Transition/_Transition'
], function (
	scheduler,
	warn,
	Transition
) {

	'use strict';

	return function ( descriptor, ractive, owner, contextStack, isIntro ) {
		var transition,
			node,
			instance,
			manager,
			oldTransition;

		if ( !ractive.transitionsEnabled || ( ractive._parent && !ractive._parent.transitionsEnabled ) ) {
			return;
		}

		// get transition name, args and function
		transition = new Transition( descriptor, ractive, owner, contextStack, isIntro );

		if ( transition._fn ) {
			node = transition.node;

			// Attach to a transition manager (either this instance's, or whichever
			// ancestor triggered the transition)
			instance = ractive;
			do {
				manager = instance._transitionManager;
				instance = instance._parent;
			} while ( !manager );
			transition._manager = manager;

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
				scheduler.addTransition( transition );
			} else {
				transition.init();
			}
		}
	};

});
