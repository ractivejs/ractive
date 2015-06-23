import Element from '../../Element';

export default class Doctype extends Element {
	toString () {
		return '<!DOCTYPE' + this.template.dd + '>';
	}
}
