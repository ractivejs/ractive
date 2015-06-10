import Fragment from '../Fragment';

export default class Element {
	constructor ( options ) {
		this.parentFragment = options.parentFragment;
		this.template = options.template;
		this.index = options.index;

		this.fragment = new Fragment({
			template: options.template.f,
			owner: this
		});
	}

	bind () {
		this.fragment.bind();
	}

	render () {
		const node = document.createElement( this.template.e );
		node.appendChild( this.fragment.render() );

		return ( this.node = node );
	}

	unbind () {
		this.fragment.unbind();
	}

	toString () {
		const tagName = this.template.e;
		return `<${tagName}>${this.fragment.toString()}</${tagName}>`;
	}
}
