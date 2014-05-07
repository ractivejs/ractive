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
		return new Text( options, this.docFrag );
	}

	switch ( options.template.t ) {
		case types.INTERPOLATOR: return new Interpolator( options, this.docFrag );
		case types.SECTION:      return new Section( options, this.docFrag );
		case types.TRIPLE:       return new Triple( options, this.docFrag );
		case types.ELEMENT:
			if ( this.root.components[ options.template.e ] ) {
				return new Component( options, this.docFrag );
			}
			return new Element( options, this.docFrag );
		case types.PARTIAL:      return new Partial( options, this.docFrag );
		case types.COMMENT:      return new Comment( options, this.docFrag );

		default: throw new Error( 'Something very strange happened. Please file an issue at https://github.com/ractivejs/ractive/issues. Thanks!' );
	}
}
