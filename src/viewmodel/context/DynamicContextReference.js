import ContextReference from './ContextReference';

// DynamicContextReference are keypath expressions
// like `foo[bar]` where the Context Reference may
// be changed based on the value of `bar`

class DynamicContextReference extends ContextReference {

	constructor ( key, reference ) {
		super( '[' + key + ']' );
		this.reference = reference;
		reference.register({
			mark: () => this.reset()
		}, 'computed' );
	}

	getJoinKey () {
		return this.reference.get();
	}
}

export default DynamicContextReference;
