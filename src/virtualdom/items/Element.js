import { ELEMENT } from 'config/types';
import Item from './shared/Item';
import Fragment from '../Fragment';
import Attribute from './element/Attribute';
import { voidElementNames } from 'utils/html';

export default class Element extends Item {
	constructor ( options ) {
		super( options );
		
		this.parentFragment = options.parentFragment;
		this.template = options.template;
		this.index = options.index;

		this.isVoid = voidElementNames.test( options.template.e );

		this.attributes = this.template.a ?
			Object.keys( this.template.a ).map( name => {
				return new Attribute({
					name,
					element: this,
					template: this.template.a[ name ]
				})
			}) :
			[];

		if ( options.template.f ) {
			this.fragment = new Fragment({
				template: options.template.f,
				owner: this
			});
		}
	}

	bind () {
		this.attributes.forEach( attr => attr.bind() );

		if ( this.fragment ) {
			this.fragment.bind();
		}
	}

	bubble () {
		if ( !this.dirty ) {
			this.dirty = true;
			this.parentFragment.bubble();
		}
	}

	render () {
		const node = document.createElement( this.template.e );
		this.node = node;

		if ( this.fragment ) {
			node.appendChild( this.fragment.render() );
		}

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

		if ( this.isVoid ) {
			return `<${tagName}${attrs}/>`;
		}

		const contents = this.fragment ? this.fragment.toString() : '';

		return `<${tagName}${attrs}>${contents}</${tagName}>`;
	}

	unbind () {
		if ( this.fragment ) {
			this.fragment.unbind();
		}
	}

	update () {
		if ( this.fragment ) {
			this.fragment.update();
		}
	}
}
