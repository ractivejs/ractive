export const extern = {};

export default function extendContext ( ractive, ...assigns ) {
	const fragment = ractive.fragment || ractive._fakeFragment || ( ractive._fakeFragment = new FakeFragment( ractive ) );

	assigns.unshift( Object.create( fragment.getContextObject() ) );
	return Object.assign.apply( Object, assigns );
}

export function getContextObject () {
	if ( !this.ctx ) this.ctx = new extern.Context( this );
	return this.ctx;
}

class FakeFragment {
	constructor ( ractive ) {
		this.ractive = ractive;
		this.parent = ractive;
	}

	find () {}
	findComponent () {}
	findAll () { return []; }
	findAllCompoennts () { return  []; }

	findContext () {
		return this.ractive.viewmodel;
	}

	findRepeatingFragment () {}
}

FakeFragment.prototype.getContextObject = getContextObject;
