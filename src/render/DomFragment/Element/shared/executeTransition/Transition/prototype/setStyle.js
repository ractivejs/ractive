define([
	'render/DomFragment/Element/shared/executeTransition/Transition/helpers/prefix'
], function (
	prefix
) {

	'use strict';

	return function ( style, value ) {
		var prop;

		if ( typeof style === 'string' ) {
			this.node.style[ prefix( style ) ] = value;
		}

		else {
			for ( prop in style ) {
				if ( style.hasOwnProperty( prop ) ) {
					this.node.style[ prefix( prop ) ] = style[ prop ];
				}
			}
		}

		return this;
	};

});
