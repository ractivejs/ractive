import Context from './Context';

const noopStore = {};

export class IndexSpecial extends Context {

	constructor () {
		// babel bug
		this.that = 0;
		super( '@index', noopStore );
	}

	get () {
		return this.parent.index;
	}

	set () {
		throw new Error('cannot set @index');
	}

	// required as child or Reference
	reset () {

	}
}

export class KeySpecial extends Context {

	constructor () {
		// babel bug
		this.that = 0;
		super( '@key', noopStore );
	}

	get () {
		return this.parent.getKey();
	}

	set () {
		throw new Error('cannot set @key');
	}

	// required as child of Reference
	reset () {

	}
}

export class KeypathSpecial extends Context {

	constructor () {
		// babel bug
		this.that = 0;
		super( '@keypath', noopStore );
	}

	get () {
		return this.parent.getKeypath();
	}

	set () {
		throw new Error('cannot set @keypath');
	}
}
