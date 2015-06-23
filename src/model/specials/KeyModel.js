import { warnIfDebug } from 'utils/log';
import { removeFromArray } from 'utils/array';
import { handleChange } from 'shared/methodCallers';

export default class KeyModel {
	constructor ( parent ) {
		this.parent = parent;
		this.value = parent.key;

		this.isReadonly = true;

		this.dependants = [];
	}

	get () {
		return this.parent.key;
	}

	getKeypath () {
		// TODO would be nice if there were some way of knowing *which*
		// key reference was being used
		return '@key';
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
