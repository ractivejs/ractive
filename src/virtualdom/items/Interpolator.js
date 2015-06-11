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

	render () {
		const string = this.model ? safeToStringValue( this.model.value ) : '';
		return ( this.node = document.createTextNode( string ) );
	}

	toString ( escape ) {
		const string = this.model ? safeToStringValue( this.model.value ) : '';
		return escape ? escapeHtml( string ) : string;
	}

	unrender ( shouldDestroy ) {
		if ( shouldDestroy ) this.detach();
	}

	update () {
		if ( this.dirty ) {
			this.node.data = this.model.value;
			this.dirty = false;
		}
	}

	valueOf () {
		return this.model ? this.model.value : undefined;
	}
}
