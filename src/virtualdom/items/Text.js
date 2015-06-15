import { escapeHtml } from 'utils/html';

export default class Text {
	constructor ( str ) {
		this.str = str;
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
