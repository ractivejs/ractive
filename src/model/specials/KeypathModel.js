import { removeFromArray } from '../../utils/array';
import { handleChange } from '../../shared/methodCallers';

export default class KeypathModel {
	constructor ( parent ) {
		this.parent = parent;
		this.value = parent.getKeypath();
		this.dependants = [];
	}

	get () {
		return this.value;
	}

	handleChange () {
		this.value = this.parent.getKeypath();
		this.dependants.forEach( handleChange );
	}

	register ( dependant ) {
		this.dependants.push( dependant );
	}

	unregister ( dependant ) {
		removeFromArray( this.dependants, dependant );
	}
}
