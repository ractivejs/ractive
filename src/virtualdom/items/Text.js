import { escapeHtml } from 'utils/html';
import Item from './shared/Item';

export default class Text extends Item {
	constructor ( options ) {
		super( options );
		this.str = options.template;
	}

	bind () {
		// noop
	}

	detach () {
		if ( !this.node.parentNode ) {
			throw new Error( 'WTF' );
		}
		return this.node.parentNode.removeChild( this.node );
	}

	firstNode () {
		return this.node;
	}

	render () {
		return ( this.node = document.createTextNode( this.str ) );
	}

	toString ( escape ) {
		return escape ? escapeHtml( this.str ) : this.str;
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
		return this.str;
	}
}
