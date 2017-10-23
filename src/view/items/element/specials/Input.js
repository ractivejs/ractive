import Element from '../../Element';
import { isFunction } from 'utils/is';

export default class Input extends Element {
	render ( target, occupants ) {
		super.render( target, occupants );
		this.node.defaultValue = this.node.value;
	}
	compare ( value, attrValue ) {
		const comparator = this.getAttribute( 'value-comparator' );
		if ( comparator ) {
			if ( isFunction( comparator ) ) {
				return comparator( value, attrValue );
			}
			if (value && attrValue) {
				return value[comparator] == attrValue[comparator];
			}
		}
		return value == attrValue;
	}
}
