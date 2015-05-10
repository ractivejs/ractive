import ContextReference from './ContextReference';

// DynamicContextReference are keypath expressions
// like `foo[bar]` where the Context Reference may
// be changed based on the value of `bar`

class DynamicContextReference extends ContextReference {

	constructor ( key, reference ) {
		super( '[' + key + ']' );
		this.reference = reference;
		reference.registerComputed({
			mark: () => this.reset()
		});
	}

	getJoinKey () {
		return this.reference.get();
	}
}

export default DynamicContextReference;
