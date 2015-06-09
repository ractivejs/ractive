export default class DataNode {
	constructor ( parent, property ) {
		console.log( 'parent, property', parent, property );

		this.parent = parent;
		this.viewmodel = parent.viewmodel;
		this.property = property;

		this.deps = [];
	}

	get () {
		const parentValue = this.parent.get();
		if ( parentValue ) {
			return parentValue[ this.property ];
		}
	}

	register ( dependant ) {
		this.deps.push( dependant );
		dependant.setValue( this.get() );
	}
}
