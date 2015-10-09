import { doc } from '../../config/environment';
import { TEXT } from '../../config/types';
import { escapeHtml } from '../../utils/html';
import Item from './shared/Item';
import { detachNode } from '../../utils/dom';

export default class Text extends Item {
	constructor ( options ) {
		super( options );
		this.type = TEXT;
	}

	bind () {
		// noop
	}

	detach () {
		return detachNode( this.node );
	}

	firstNode () {
		return this.node;
	}

	rebind () {
		// noop
	}

	render ( target ) {
		this.node = doc.createTextNode( this.template );
		target.appendChild( this.node );
		this.rendered = true;
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
