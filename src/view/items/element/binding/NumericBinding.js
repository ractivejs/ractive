import Binding from './Binding';

export default class NumericBinding extends Binding {
	getInitialValue () {
		return undefined;
	}
	
	getValue () {
		const value = parseFloat( this.node.value );
		return isNaN( value ) ? undefined : value;
	}
}
