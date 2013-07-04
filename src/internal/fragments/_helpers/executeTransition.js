var executeTransition = function ( descriptor, root, owner, contextStack, isIntro ) {
	var transitionName, transitionParams, fragment, transitionManager, transition;

	if ( typeof descriptor === 'string' ) {
		transitionName = descriptor;
	} else {
		transitionName = descriptor.n;

		if ( descriptor.a ) {
			transitionParams = descriptor.a;
		} else if ( descriptor.d ) {
			fragment = new TextFragment({
				descriptor:   descriptor.d,
				root:         root,
				owner:        owner,
				contextStack: parentFragment.contextStack
			});

			transitionParams = fragment.toJson();
			fragment.teardown();
		}
	}

	transition = root.transitions[ transitionName ] || Ractive.transitions[ transitionName ];

	if ( transition ) {
		transitionManager = root._transitionManager;

		transitionManager.push();
		transition.call( root, owner.node, transitionManager.pop, transitionParams, transitionManager.info, isIntro );
	}
};