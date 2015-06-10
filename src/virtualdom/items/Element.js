import Fragment from '../Fragment';
import Attribute from './element/Attribute';

export default class Element {
	constructor ( options ) {
		this.parentFragment = options.parentFragment;
		this.template = options.template;
		this.index = options.index;

		this.attributes = this.template.a ?
			Object.keys( this.template.a ).map( name => {
				return new Attribute({
					name,
					element: this,
					template: this.template.a[ name ]
				})
			}) :
			[];

		this.fragment = new Fragment({
			template: options.template.f,
			owner: this
		});
	}

	bind () {
		this.attributes.forEach( attr => attr.bind() );
		this.fragment.bind();
	}

	bubble () {
		if ( !this.dirty ) {
			this.dirty = true;
			this.parentFragment.bubble();
		}
	}

	render () {
		const node = document.createElement( this.template.e );
		node.appendChild( this.fragment.render() );

		this.node = node;

		this.attributes.forEach( attr => attr.render() );

		return node;
	}

	toString () {
		const tagName = this.template.e;

		const attrs = this.attributes
			.map( attr => {
				return ` ${attr.toString()}`;
			})
			.join( '' );

		return `<${tagName}${attrs}>${this.fragment.toString()}</${tagName}>`;
	}

	unbind () {
		this.fragment.unbind();
	}

	update () {
		this.fragment.update();
	}
}
