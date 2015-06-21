import { removeFromArray } from 'utils/array';
import { handleChange } from 'shared/methodCallers';

// TODO is this basically identical to KeyResolver? dedupe?
export default class IndexResolver {
	constructor ( parent ) {
		this.parent = parent;
		this.value = parent.key;

		this.dependants = [];
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
