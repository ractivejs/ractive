import GenericBinding from './GenericBinding';

export default class FileBinding extends GenericBinding {
	getInitialValue () {
		/* istanbul ignore next */
		return undefined;
	}

	getValue () {
		/* istanbul ignore next */
		return this.node.files;
	}

	render () {
		/* istanbul ignore next */
		this.element.lazy = false;
		/* istanbul ignore next */
		super.render();
	}

	setFromNode( node ) {
		/* istanbul ignore next */
		this.model.set( node.files );
	}
}

