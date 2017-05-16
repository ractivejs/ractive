import noop from '../utils/noop';

export const extern = {};

export default function getRactiveContext ( ractive, ...assigns ) {
	const fragment = ractive.fragment || ractive._fakeFragment || ( ractive._fakeFragment = new FakeFragment( ractive ) );
	return fragment.getContext.apply( fragment, assigns );
}

export function getContext ( ...assigns ) {
	if ( !this.ctx ) this.ctx = new extern.Context( this );
	assigns.unshift( Object.create( this.ctx ) );
	return Object.assign.apply( null, assigns );
}

export class FakeFragment {
	constructor ( ractive ) {
		this.ractive = ractive;
	}

	findContext () { return this.ractive.viewmodel; }
}
const proto = FakeFragment.prototype;
proto.getContext = getContext;
proto.find = proto.findComponent = proto.findAll = proto.findAllComponents = noop;
