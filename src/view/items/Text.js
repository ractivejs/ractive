import { TEXT } from 'config/types';
import { escapeHtml } from 'utils/html';
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

	render () {
		return ( this.node = document.createTextNode( this.template ) );
	}

	toString ( escape ) {
		return escape ? escapeHtml( this.template ) : this.template;
	}

	unbind () {
		// noop
	}

	unrender ( shouldDestroy ) {
		if ( shouldDestroy ) this.detach();
	}

	update () {
		// noop
	}

	valueOf () {
		return this.template;
	}
}
