import { doc } from 'config/environment';
import { svg } from 'config/namespaces';
import { createElement } from 'utils/dom';
import { toArray } from 'utils/array';
import Fragment from 'view/Fragment';
import Item from '../shared/Item';

const div = doc ? createElement( 'div' ) : null;

export default class ConditionalAttribute extends Item {
	constructor ( options ) {
		super( options );

		this.attributes = [];

		this.owner = options.owner;

		this.fragment = new Fragment({
			ractive: this.ractive,
			owner: this,
			template: [ this.template ]
		});

		this.dirty = false;
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

		this.rendered = true;
		this.update();
	}

	toString () {
		return this.fragment.toString();
	}

	unbind () {
		this.fragment.unbind();
	}

	unrender () {
		this.rendered = false;
	}

	update () {
		if ( this.dirty ) {
			this.fragment.update();

			if ( this.rendered ) {
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
			}

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
