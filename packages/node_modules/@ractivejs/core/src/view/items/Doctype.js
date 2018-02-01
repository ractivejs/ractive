import Item from './shared/Item';
import noop from '../../utils/noop';

export default class Doctype extends Item {
	toString () {
		return '<!DOCTYPE' + this.template.a + '>';
	}
}

const proto = Doctype.prototype;
proto.bind = proto.render = proto.teardown = proto.unbind = proto.unrender = proto.update = noop;
