import { addToArray, removeFromArray } from 'utils/array';

export default class ComputedNode {
	constructor ( viewmodel, signature ) {
		this.viewmodel = viewmodel;
		this.signature = signature;

		this.value = this.getValue();

		this.children = [];
		this.childByKey = {};

		this.deps = [];
	}

	getValue () {
		return this.signature.getter();
	}

	register ( dependant ) {
		this.deps.push( dependant );
	}

	unregister ( dependant ) {
		removeFromArray( this.deps, dependant );
	}
}
