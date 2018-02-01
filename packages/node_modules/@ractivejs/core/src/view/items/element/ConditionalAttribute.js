import { doc } from '../../../config/environment';
import { svg } from '../../../config/namespaces';
import { createElement } from '../../../utils/dom';
import { toArray } from '../../../utils/array';
import Fragment from '../../Fragment';
import Item from '../shared/Item';
import noop from '../../../utils/noop';

const div = doc ? createElement( 'div' ) : null;

let attributes = false;
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
			template: this.template
		});
		// this fragment can't participate in node-y things
		this.fragment.findNextNode = noop;

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

	destroyed () {
		this.unrender();
	}

	render () {
		this.node = this.owner.node;
		if ( this.node ) {
			this.isSvg = this.node.namespaceURI === svg;
		}

		attributes = true;
		if ( !this.rendered ) this.fragment.render();

		this.rendered = true;
		this.dirty = true; // TODO this seems hacky, but necessary for tests to pass in browser AND node.js
		this.update();
		attributes = false;
	}

	toString () {
		return this.fragment.toString();
	}

	unbind () {
		this.fragment.unbind();
	}

	unrender () {
		this.rendered = false;
		this.fragment.unrender();
	}

	update () {
		let str;
		let attrs;

		if ( this.dirty ) {
			this.dirty = false;

			const current = attributes;
			attributes = true;
			this.fragment.update();

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

			attributes = current || false;
		}
	}
}

const onlyWhitespace = /^\s*$/;
function parseAttributes ( str, isSvg ) {
	if ( onlyWhitespace.test( str ) ) return [];
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
