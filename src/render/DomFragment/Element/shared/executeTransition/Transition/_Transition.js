define([
	'utils/warn',
	'render/StringFragment/_StringFragment',
	'render/DomFragment/Element/shared/executeTransition/Transition/prototype/init',
	'render/DomFragment/Element/shared/executeTransition/Transition/prototype/getStyle',
	'render/DomFragment/Element/shared/executeTransition/Transition/prototype/setStyle',
	'render/DomFragment/Element/shared/executeTransition/Transition/prototype/animateStyle/_animateStyle',
	'render/DomFragment/Element/shared/executeTransition/Transition/prototype/processParams',
	'render/DomFragment/Element/shared/executeTransition/Transition/prototype/resetStyle'
], function (
	warn,
	StringFragment,
	init,
	getStyle,
	setStyle,
	animateStyle,
	processParams,
	resetStyle
) {

	'use strict';

	var Transition;

	Transition = function ( descriptor, root, owner, isIntro ) {
		var t = this, name, fragment, errorMessage;

		this.root = root;
		this.node = owner.node;
		this.isIntro = isIntro;

		// store original style attribute
		this.originalStyle = this.node.getAttribute( 'style' );

		// create t.complete() - we don't want this on the prototype,
		// because we don't want `this` silliness when passing it as
		// an argument
		t.complete = function ( noReset ) {
			if ( !noReset && t.isIntro ) {
				t.resetStyle();
			}

			t.node._ractive.transition = null;
			t._manager.remove( t );
		};


		name = descriptor.n || descriptor;

		if ( typeof name !== 'string' ) {
			fragment = new StringFragment({
				descriptor:   name,
				root:         this.root,
				owner:        owner
			});

			name = fragment.toString();
			fragment.teardown();
		}

		this.name = name;

		if ( descriptor.a ) {
			this.params = descriptor.a;
		}

		else if ( descriptor.d ) {
			// TODO is there a way to interpret dynamic arguments without all the
			// 'dependency thrashing'?
			fragment = new StringFragment({
				descriptor:   descriptor.d,
				root:         this.root,
				owner:        owner
			});

			this.params = fragment.toArgsList();
			fragment.teardown();
		}

		this._fn = root.transitions[ name ];
		if ( !this._fn ) {
			errorMessage = 'Missing "' + name + '" transition. You may need to download a plugin via http://docs.ractivejs.org/latest/plugins#transitions';

			if ( root.debug ) {
				throw new Error( errorMessage );
			} else {
				warn( errorMessage );
			}

			return;
		}
	};

	Transition.prototype = {
		init: init,
		getStyle: getStyle,
		setStyle: setStyle,
		animateStyle: animateStyle,
		processParams: processParams,
		resetStyle: resetStyle
	};

	return Transition;

});
