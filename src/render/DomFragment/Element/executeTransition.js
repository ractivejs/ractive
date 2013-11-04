define([
	'config/isClient',
	'utils/warn',
	'render/DomFragment/Element/Transition'
], function (
	isClient,
	warn,
	Transition
) {
	
	'use strict';

	if ( !isClient ) {
		// not relevant server-side
		return;
	}

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
			// TODO remove this warning after a few versions. Also, change URL when repo switches owner
			if ( transition._fn.length !== 1 ) {
				warn( 'The transitions API has changed. See https://github.com/Rich-Harris/Ractive/wiki/Transitions for details' );
			}

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
				root._defTransitions.push( transition );
			} else {
				transition.init();
			}
		}
	};

});