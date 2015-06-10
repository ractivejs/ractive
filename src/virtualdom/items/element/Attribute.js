import Fragment from '../../Fragment';

export default class Attribute {
	constructor ( options ) {
		this.name = options.name;
		this.element = options.element;
		this.ractive = options.ractive;
		this.parentFragment = options.element.parentFragment; // shared


		this.fragment = new Fragment({
			owner: this,
			template: options.template
		});
	}

	bind () {
		this.fragment.bind();
	}

	render () {
		this.element.node.setAttribute( this.name, this.fragment.toString() );
	}

	toString () {
		return `${this.name}="${this.fragment.toString()}"`;
	}
}
