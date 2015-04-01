import Model from './Model';

var noopStore = {};

class Index extends Model {

	constructor () {
		this.that = 0;
		super( '@index', noopStore );
	}

	get () {
		return this.parent.index;
	}

	set () {
		throw new Error('cannot set @index');
	}
}

export default Index;
