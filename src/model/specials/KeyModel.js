import { warnIfDebug } from 'utils/log';
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
		// TODO would be nice if there were some way of knowing *which*
		// key reference was being used
		return '@key';
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
