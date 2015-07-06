import Item from './shared/Item';

export default class Doctype extends Item {
	bind () {
		// noop
	}

	render () {
		// noop
	}

	teardown () {
		// noop
	}

	toString () {
		return '<!DOCTYPE' + this.template.a + '>';
	}

	unbind () {
		// noop
	}

	unrender () {
		// noop
	}
}
