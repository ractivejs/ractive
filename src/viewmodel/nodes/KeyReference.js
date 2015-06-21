import { removeFromArray } from 'utils/array';

export default class KeypathResolver {
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
