import { removeFromArray } from 'utils/array';
import { handleChange } from 'shared/methodCallers';

export default class KeyModel {
	constructor ( key ) {
		this.value = key;
		this.isReadonly = true;
		this.dependants = [];
	}

	get () {
		return this.value;
	}

	getKeypath () {
		return this.value;
	}

	rebind ( key ) {
		this.value = key;
		this.dependants.forEach( handleChange );
	}

	register ( dependant ) {
		this.dependants.push( dependant );
	}

	unregister ( dependant ) {
		removeFromArray( this.dependants, dependant );
	}
}
