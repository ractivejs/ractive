define(['config/types','virtualdom/items/Text','virtualdom/items/Interpolator','virtualdom/items/Section/_Section','virtualdom/items/Triple/_Triple','virtualdom/items/Element/_Element','virtualdom/items/Partial/_Partial','virtualdom/items/Component/getComponent','virtualdom/items/Component/_Component','virtualdom/items/Comment','virtualdom/items/Yielder'],function (types, Text, Interpolator, Section, Triple, Element, Partial, getComponent, Component, Comment, Yielder) {

	'use strict';
	
	return function createItem ( options ) {
		if ( typeof options.template === 'string' ) {
			return new Text( options );
		}
	
		switch ( options.template.t ) {
			case types.INTERPOLATOR:
				if ( options.template.r === 'yield' ) {
					return new Yielder( options );
				}
				return new Interpolator( options );
			case types.SECTION:      return new Section( options );
			case types.TRIPLE:       return new Triple( options );
			case types.ELEMENT:
				var constructor;
				if ( constructor = getComponent( options.parentFragment.root, options.template.e ) ) {
					return new Component( options, constructor );
				}
				return new Element( options );
			case types.PARTIAL:      return new Partial( options );
			case types.COMMENT:      return new Comment( options );
	
			default: throw new Error( 'Something very strange happened. Please file an issue at https://github.com/ractivejs/ractive/issues. Thanks!' );
		}
	};

});