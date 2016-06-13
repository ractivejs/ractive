import { doc } from '../../config/environment';
import { escapeHtml } from '../../utils/html';
import { safeToStringValue } from '../../utils/dom';
import Mustache from './shared/Mustache';
import { detachNode } from '../../utils/dom';
import { inAttributes } from './element/ConditionalAttribute';

export default class Interpolator extends Mustache {
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

		if ( occupants ) {
			let n = occupants[0];
			if ( n && n.nodeType === 3 ) {
				occupants.shift();
				if ( n.nodeValue !== value ) {
					n.nodeValue = value;
				}
			} else {
				n = this.node = doc.createTextNode( value );
				if ( occupants[0] ) {
					target.insertBefore( n, occupants[0] );
				} else {
					target.appendChild( n );
				}
			}

			this.node = n;
		} else {
			this.node = doc.createTextNode( value );
			target.appendChild( this.node );
		}
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
