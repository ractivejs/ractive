import progressiveText from './shared/progressiveText';
import { TEXT } from '../../config/types';
import { escapeHtml } from '../../utils/html';
import Item from './shared/Item';
import { detachNode } from '../../utils/dom';
import { inAttributes } from './element/ConditionalAttribute';
import noop from '../../utils/noop';

export default class Text extends Item {
	constructor ( options ) {
		super( options );
		this.type = TEXT;
	}

	detach () {
		return detachNode( this.node );
	}

	firstNode () {
		return this.node;
	}

	render ( target, occupants ) {
		if ( inAttributes() ) return;
		this.rendered = true;

		progressiveText( this, target, occupants, this.template );
	}

	toString ( escape ) {
		return escape ? escapeHtml( this.template ) : this.template;
	}

	unrender ( shouldDestroy ) {
		if ( this.rendered && shouldDestroy ) this.detach();
		this.rendered = false;
	}

	valueOf () {
		return this.template;
	}
}

const proto = Text.prototype;
proto.bind = proto.unbind = proto.update = noop;
