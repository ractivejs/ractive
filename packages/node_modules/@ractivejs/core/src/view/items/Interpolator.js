import progressiveText from './shared/progressiveText';
import { escapeHtml } from '../../utils/html';
import { safeToStringValue } from '../../utils/dom';
import Mustache from './shared/Mustache';
import { detachNode } from '../../utils/dom';
import { inAttributes } from './element/ConditionalAttribute';

export default class Interpolator extends Mustache {
	bubble () {
		if ( this.owner ) this.owner.bubble();
		super.bubble();
	}

	detach () {
		return detachNode( this.node );
	}

	firstNode () {
		return this.node;
	}

	getString () {
		return this.model ? safeToStringValue( this.model.get() ) : '';
	}

	render ( target, occupants ) {
		if ( inAttributes() ) return;
		const value = this.getString();

		this.rendered = true;

		progressiveText( this, target, occupants, value );
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
			this.dirty = false;
			if ( this.rendered ) {
				this.node.data = this.getString();
			}
		}
	}

	valueOf () {
		return this.model ? this.model.get() : undefined;
	}
}
