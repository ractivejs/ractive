import { escapeHtml } from 'utils/html';
import { safeToStringValue } from 'utils/dom';
import Mustache from './shared/Mustache';

export default class Interpolator extends Mustache {
	constructor ( options ) {
		super( options );
	}

	detach () {
		return this.node.parentNode.removeChild( this.node );
	}

	firstNode () {
		return this.node;
	}

	getString () {
		return this.model ? safeToStringValue( this.model.value ) : '';
	}

	render () {
		this.rendered = true;
		return ( this.node = document.createTextNode( this.getString() ) );
	}

	toString ( escape ) {
		const string = this.getString();
		return escape ? escapeHtml( string ) : string;
	}

	unrender ( shouldDestroy ) {
		if ( shouldDestroy ) this.detach();
		this.rendered = false;
	}

	update () {
		if ( this.dirty ) {
			if ( this.rendered ) {
				this.node.data = this.getString();
			}

			this.dirty = false;
		}
	}

	valueOf () {
		return this.model ? this.model.value : undefined;
	}
}
