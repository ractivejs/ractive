import BindingContext from './BindingContext';

const NOOP_STORE = {};

class SpecialContext extends BindingContext {

	constructor ( special ) {
		super( special, NOOP_STORE );
	}

	set ( value ) {
		throw new Error(`Attempted to set ${this.key} to ${value}, but it is not settable.`);
	}

	// required if this is used as child of ContextReference
	reset () {

	}
}

class IndexSpecial extends SpecialContext {

	constructor () {
		super( '@index');
	}

	get () {
		return this.parent.index;
	}
}

class KeySpecial extends SpecialContext {

	constructor () {
		super( '@key' );
	}

	get () {
		return this.parent.getKey();
	}
}

class KeypathSpecial extends SpecialContext {

	constructor () {
		super( '@keypath' );
	}

	get () {
		return this.parent.getKeypath();
	}
}

export { IndexSpecial };
export { KeySpecial };
export { KeypathSpecial };
