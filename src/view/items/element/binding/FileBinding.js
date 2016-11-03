import GenericBinding from './GenericBinding';

export default class FileBinding extends GenericBinding {
	getInitialValue () {
		return undefined;
	}

	getValue () {
		return this.node.files;
	}

	render () {
		this.element.lazy = false;
		super.render();
	}

	setFromNode( node ) {
		this.model.set( node.files );
	}
}

