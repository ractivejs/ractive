import noop from 'utils/noop';

var Doctype = function ( options ) {
	this.declaration = options.template.a;
};

Doctype.prototype = {
	init: noop,
	render: noop,
	unrender: noop,
	teardown: noop,
	toString () {
		return '<!DOCTYPE' + this.declaration + '>';
	}
};

export default Doctype;