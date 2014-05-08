import types from 'config/types';
import Text from 'parallel-dom/items/Text';
import Interpolator from 'parallel-dom/items/Interpolator';
import Section from 'parallel-dom/items/Section/_Section';
import Triple from 'parallel-dom/items/Triple/_Triple';
import Element from 'parallel-dom/items/Element/_Element';
import Partial from 'parallel-dom/items/Partial/_Partial';
import Component from 'parallel-dom/items/Component/_Component';
import Comment from 'parallel-dom/items/Comment';

export default function Fragment$createItem ( options ) {
	if ( typeof options.template === 'string' ) {
		return new Text( options );
	}

	switch ( options.template.t ) {
		case types.INTERPOLATOR: return new Interpolator( options );
		case types.SECTION:      return new Section( options );
		case types.TRIPLE:       return new Triple( options );
		case types.ELEMENT:
			if ( this.root.components[ options.template.e ] ) {
				return new Component( options );
			}
			return new Element( options );
		case types.PARTIAL:      return new Partial( options );
		case types.COMMENT:      return new Comment( options );

		default: throw new Error( 'Something very strange happened. Please file an issue at https://github.com/ractivejs/ractive/issues. Thanks!' );
	}
}
