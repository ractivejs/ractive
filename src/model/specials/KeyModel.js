import { removeFromArray } from 'utils/array';
import { handleChange } from 'shared/methodCallers';

export default class KeyModel {
	constructor ( parent ) {
		this.parent = parent;
		this.value = parent.key;

		this.dependants = [];
	}

	get () {
		return this.parent.key;
	}

	getKeypath () {
		return this.parent.getKeypath();
	}

	handleChange () {
		this.value = this.parent.key;
		this.dependants.forEach( handleChange );
	}

	register ( dependant ) {
		this.dependants.push( dependant );
	}

	unregister ( dependant ) {
		removeFromArray( this.dependants, dependant );
	}
}
