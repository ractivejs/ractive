import { addToArray, removeFromArray } from 'utils/array';
import { isEqual } from 'utils/is';
import { handleChange, mark } from 'shared/methodCallers';

export default class ComputedNode {
	constructor ( viewmodel, signature ) {
		this.viewmodel = viewmodel;
		this.signature = signature;

		this.hardDependencies = signature.dependencies;
		this.hardDependencies.forEach( model => {
			model.register( this );
		});

		this.value = this.getValue();

		this.children = [];
		this.childByKey = {};

		this.deps = [];
	}

	getValue () {
		return this.signature.getter();
	}

	handleChange () {
		const value = this.getValue();
		if ( isEqual( value, this.value ) ) return;

		this.value = value;

		this.deps.forEach( handleChange );
		this.children.forEach( mark );
	}

	register ( dependant ) {
		this.deps.push( dependant );
	}

	unregister ( dependant ) {
		removeFromArray( this.deps, dependant );
	}
}
