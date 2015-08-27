import Element from '../../Element';

export default class Input extends Element {
	render ( target ) {
		super.render( target );
		this.node.defaultValue = this.node.value;
	}
}
