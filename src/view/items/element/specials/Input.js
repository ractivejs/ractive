import Element from '../../Element';

export default class Input extends Element {
	render () {
		const node = super.render();
		node.defaultValue = node.value;

		return node;
	}
}
