import { svg } from 'config/namespaces';
import { createElement } from 'utils/dom';
import { toArray } from 'utils/array';
import Fragment from 'view/Fragment';
import Item from '../shared/Item';

let div;

if ( typeof document !== 'undefined' ) {
	div = createElement( 'div' );
}

export default class ConditionalAttribute extends Item {
	constructor ( options ) {
		super( options );

		// this.element = options.element;
		// this.ractive = options.element.ractive;
		// this.parentFragment = element.parentFragment;

		this.attributes = [];

		this.owner = options.owner;

		this.fragment = new Fragment({
			ractive: this.ractive,
			owner: this,
			template: [ this.template ]
		});

		this.dirty = true;
	}

	bind () {
		this.fragment.bind();
	}

	bubble () {
		if ( !this.dirty ) {
			this.dirty = true;
			this.owner.bubble();
		}
	}

	rebind () {
		throw new Error( 'ConditionalAttribute$rebind is not yet implemented' ); // TODO test
	}

	render () {
		this.node = this.owner.node;
		this.isSvg = this.node.namespaceURI === svg;

		this.update();
	}

	toString () {
		return this.fragment.toString();
	}

	unbind () {
		this.fragment.unbind();
	}

	update () {
		if ( this.dirty ) {
			this.fragment.update();
			const str = this.fragment.toString();
			const attrs = parseAttributes( str, this.isSvg );

			// any attributes that previously existed but no longer do
			// must be removed
			this.attributes.filter( a => notIn( attrs, a ) ).forEach( a => {
				this.node.removeAttribute( a.name );
			});

			attrs.forEach( a => {
				this.node.setAttribute( a.name, a.value );
			});

			this.attributes = attrs;

			this.dirty = false;
		}
	}
}


function parseAttributes ( str, isSvg ) {
	const tagName = isSvg ? 'svg' : 'div';
	div.innerHTML = `<${tagName} ${str}></${tagName}>`;

	return toArray( div.childNodes[0].attributes );
}

function notIn ( haystack, needle ) {
	let i = haystack.length;

	while ( i-- ) {
		if ( haystack[i].name === needle.name ) {
			return false;
		}
	}

	return true;
}
