import { doc } from '../../config/environment';
import { TEXT } from '../../config/types';
import { escapeHtml } from '../../utils/html';
import Item from './shared/Item';

export default class Text extends Item {
	constructor ( options ) {
		super( options );
		this.type = TEXT;
	}

	bind () {
		// noop
	}

	detach () {
		if ( !this.node.parentNode ) {
			throw new Error( 'TODO an unexpected situation arose' );
		}
		return this.node.parentNode.removeChild( this.node );
	}

	firstNode () {
		return this.node;
	}

	rebind () {
		// noop
	}

	render ( target, occupants ) {
		this.rendered = true;

		if ( occupants ) {
			let n = occupants[0];
			if ( n && n.nodeType === 3 ) {
				occupants.shift();
				if ( n.nodeValue !== this.template ) {
					n.nodeValue = this.template;
				}
			} else {
				n = this.node = doc.createTextNode( this.template );
				if ( occupants[0] ) {
					target.insertBefore( n, occupants[0] );
				} else {
					target.appendChild( n );
				}
			}

			this.node = n;
		} else {
			this.node = doc.createTextNode( this.template );
			target.appendChild( this.node );
		}
	}

	toString ( escape ) {
		return escape ? escapeHtml( this.template ) : this.template;
	}

	unbind () {
		// noop
	}

	unrender ( shouldDestroy ) {
		if ( this.rendered && shouldDestroy ) this.detach();
		this.rendered = false;
	}

	update () {
		// noop
	}

	valueOf () {
		return this.template;
	}
}
