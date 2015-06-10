import Mustache from './shared/Mustache';
import initialiseMustache from './shared/initialiseMustache';

export default class Interpolator extends Mustache {
	constructor ( options ) {
		super( options );
	}

	render () {
		const value = this.model ? this.model.value : null;
		return ( this.node = document.createTextNode( value == null ? '' : value ) );
	}

	toString () {
		const value = this.model ? this.model.value : null;
		return value == null ? '' : value;
	}

	update () {
		if ( this.dirty ) {
			this.node.data = this.model.value;
			this.dirty = false;
		}
	}
}
