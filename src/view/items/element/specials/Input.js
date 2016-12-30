import Element from '../../Element';

export default class Input extends Element {
	render ( target, occupants ) {
		super.render( target, occupants );
		this.node.defaultValue = this.node.value;
	}
}
