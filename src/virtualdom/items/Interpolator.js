import { escapeHtml } from 'utils/html';
import { safeToStringValue } from 'utils/dom';
import Mustache from './shared/Mustache';

export default class Interpolator extends Mustache {
	constructor ( options ) {
		super( options );
	}

	render () {
		const string = this.model ? safeToStringValue( this.model.value ) : '';
		return ( this.node = document.createTextNode( string ) );
	}

	toString ( escape ) {
		const string = this.model ? safeToStringValue( this.model.value ) : '';
		return escape ? escapeHtml( string ) : string;
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
