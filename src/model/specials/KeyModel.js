import { removeFromArray } from 'utils/array';

export default class KeyModel {
	constructor ( parent ) {
		this.dependants = [];
		this.value = parent.key;
	}

	register ( dependant ) {
		this.dependants.push( dependant );
	}

	unregister ( dependant ) {
		removeFromArray( this.dependants, dependant );
	}
}
