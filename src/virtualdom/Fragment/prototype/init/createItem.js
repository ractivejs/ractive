import types from 'config/types';
import Text from 'virtualdom/items/Text';
import Interpolator from 'virtualdom/items/Interpolator';
import Section from 'virtualdom/items/Section/_Section';
import Triple from 'virtualdom/items/Triple/_Triple';
import Element from 'virtualdom/items/Element/_Element';
import Partial from 'virtualdom/items/Partial/_Partial';
import getComponent from 'virtualdom/items/Component/getComponent';
import Component from 'virtualdom/items/Component/_Component';
import Comment from 'virtualdom/items/Comment';
import Yielder from 'virtualdom/items/Yielder';

export default function createItem ( options ) {
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
			let constructor;
			if ( constructor = getComponent( options.parentFragment.root, options.template.e ) ) {
				return new Component( options, constructor );
			}
			return new Element( options );
		case types.PARTIAL:      return new Partial( options );
		case types.COMMENT:      return new Comment( options );

		default: throw new Error( 'Something very strange happened. Please file an issue at https://github.com/ractivejs/ractive/issues. Thanks!' );
	}
}
