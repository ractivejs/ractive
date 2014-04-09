define([
	'global/runloop',
	'render/DomFragment/Element/shared/executeTransition/Transition/_Transition'
], function (
	runloop,
	Transition
) {

	'use strict';

	return function ( descriptor, ractive, owner, isIntro ) {
		var transition, node, oldTransition;

		// TODO this can't be right!
		if ( !ractive.transitionsEnabled || ( ractive._parent && !ractive._parent.transitionsEnabled ) ) {
			return;
		}

		// get transition name, args and function
		transition = new Transition( descriptor, ractive, owner, isIntro );

		if ( transition._fn ) {
			node = transition.node;

			// Existing transition (i.e. we're outroing before intro is complete)?
			// End it prematurely
			if ( oldTransition = node._ractive.transition ) {
				oldTransition.complete();
			}

			node._ractive.transition = transition;
			runloop.addTransition( transition );
		}
	};

});
