import types from 'config/types';
import Text from 'virtualdom/items/Text';
import Interpolator from 'virtualdom/items/Interpolator';
import Section from 'virtualdom/items/Section/_Section';
import Triple from 'virtualdom/items/Triple/_Triple';
import Element from 'virtualdom/items/Element/_Element';
import Partial from 'virtualdom/items/Partial/_Partial';
import Component from 'virtualdom/items/Component/_Component';
import Comment from 'virtualdom/items/Comment';
import config from 'config/configuration';

export default function createItem ( options ) {
	if ( typeof options.template === 'string' ) {
		return new Text( options );
	}

	switch ( options.template.t ) {
		case types.INTERPOLATOR: return new Interpolator( options );
		case types.SECTION:      return new Section( options );
		case types.TRIPLE:       return new Triple( options );
		case types.ELEMENT:
			if ( config.find( options.parentFragment.root, 'components', options.template.e ) ) {
				return new Component( options );
			}
			return new Element( options );
		case types.PARTIAL:      return new Partial( options );
		case types.COMMENT:      return new Comment( options );

		default: throw new Error( 'Something very strange happened. Please file an issue at https://github.com/ractivejs/ractive/issues. Thanks!' );
	}
}
