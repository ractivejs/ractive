import { removeFromArray } from '../../utils/array';
import { handleChange } from '../../shared/methodCallers';
import { unescapeKey } from '../../shared/keypaths';
import runloop from '../../global/runloop';

export default class KeyModel {
	constructor ( key, parent ) {
		this.value = key;
		this.isReadonly = true;
		this.dependants = [];
		this.parent = parent;
	}

	get () {
		return unescapeKey( this.value );
	}

	getKeypath () {
		return unescapeKey( this.value );
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
