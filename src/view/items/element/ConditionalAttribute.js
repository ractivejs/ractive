import { doc } from '../../../config/environment';
import { svg } from '../../../config/namespaces';
import { createElement } from '../../../utils/dom';
import { toArray } from '../../../utils/array';
import Fragment from '../../Fragment';
import Item from '../shared/Item';

const div = doc ? createElement( 'div' ) : null;

var attributes = false;
export function inAttributes() { return attributes; }
export function doInAttributes( fn ) {
	attributes = true;
	fn();
	attributes = false;
}

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
		this.fragment.rebind();
	}

	render () {
		this.node = this.owner.node;
		if ( this.node ) {
			this.isSvg = this.node.namespaceURI === svg;
		}

		attributes = true;
		this.fragment.render();
		attributes = false;

		this.rendered = true;
		this.dirty = true; // TODO this seems hacky, but necessary for tests to pass in browser AND node.js
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
		let str;
		let attrs;

		if ( this.dirty ) {
			this.dirty = false;

			attributes = true;
			this.fragment.update();
			attributes = false;

			if ( this.rendered && this.node ) {
				str = this.fragment.toString();
				attrs = parseAttributes( str, this.isSvg );

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
		}
	}
}


function parseAttributes ( str, isSvg ) {
	const tagName = isSvg ? 'svg' : 'div';
	return str
		? (div.innerHTML = `<${tagName} ${str}></${tagName}>`) &&
			toArray(div.childNodes[0].attributes)
		: [];
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
