import { escapeHtml } from 'utils/html';
import Mustache from './shared/Mustache';

export default class Interpolator extends Mustache {
	constructor ( options ) {
		super( options );
	}

	render () {
		const value = this.model ? this.model.value : null;
		return ( this.node = document.createTextNode( value == null ? '' : value ) );
	}

	toString ( escape ) {
		const value = this.model ? this.model.value : null;
		return value == null ? '' : ( escape ? escapeHtml( '' + value ) : value );
	}

	update () {
		if ( this.dirty ) {
			this.node.data = this.model.value;
			this.dirty = false;
		}
	}
}
