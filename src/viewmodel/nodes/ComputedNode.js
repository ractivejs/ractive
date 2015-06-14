import DataNode from './DataNode';
import { addToArray, removeFromArray } from 'utils/array';
import { isEqual } from 'utils/is';
import { handleChange, mark } from 'shared/methodCallers';

export default class ComputedNode extends DataNode {
	constructor ( viewmodel, signature ) {
		super( null, null );

		this.root = this.parent = viewmodel;
		this.signature = signature;
		this.context = viewmodel.computationContext;

		this.hardDependencies = signature.dependencies;
		this.hardDependencies.forEach( model => {
			model.register( this );
		});

		this.softDependencies = [];

		this.children = [];
		this.childByKey = {};

		this.deps = [];
	}

	getValue () {
		return this.signature.getter.call( this.context );
	}

	handleChange () {
		const value = this.getValue();
		if ( isEqual( value, this.value ) ) return;

		this.value = value;

		this.deps.forEach( handleChange );
		this.children.forEach( mark );
		this.clearUnresolveds();
	}

	init () {
		this.value = this.getValue();
	}

	register ( dependant ) {
		this.deps.push( dependant );
	}

	setSoftDependencies ( softDependencies ) {
		// unregister any soft dependencies we no longer have
		let i = this.softDependencies.length;
		while ( i-- ) {
			const model = this.softDependencies[i];
			if ( !~softDependencies.indexOf( model ) ) model.unregister( this );
		}

		// and add any new ones
		i = softDependencies.length;
		while ( i-- ) {
			const model = softDependencies[i];
			if ( !~this.softDependencies.indexOf( model ) ) model.register( this );
		}

		this.softDependencies = softDependencies;
	}

	unregister ( dependant ) {
		removeFromArray( this.deps, dependant );
	}
}
