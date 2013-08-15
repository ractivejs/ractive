executeTransition = function ( descriptor, root, owner, contextStack, isIntro ) {
	var transitionName, transitionParams, fragment, transitionManager, transition;

	if ( !root.transitionsEnabled ) {
		return;
	}

	if ( typeof descriptor === 'string' ) {
		transitionName = descriptor;
	} else {
		transitionName = descriptor.n;

		if ( descriptor.a ) {
			transitionParams = descriptor.a;
		} else if ( descriptor.d ) {
			fragment = new StringFragment({
				descriptor:   descriptor.d,
				root:         root,
				owner:        owner,
				contextStack: owner.parentFragment.contextStack
			});

			transitionParams = fragment.toJSON();
			fragment.teardown();
		}
	}

	transition = root.transitions[ transitionName ] || Ractive.transitions[ transitionName ];

	if ( transition ) {
		transitionManager = root._transitionManager;

		transitionManager.push( owner.node );
		transition.call( root, owner.node, function () {
			transitionManager.pop( owner.node );
		}, transitionParams, isIntro );
	}
};