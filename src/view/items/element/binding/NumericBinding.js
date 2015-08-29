import GenericBinding from './GenericBinding';

export default class NumericBinding extends GenericBinding {
	getInitialValue () {
		return undefined;
	}
	
	getValue () {
		const value = parseFloat( this.node.value );
		return isNaN( value ) ? undefined : value;
	}
}
