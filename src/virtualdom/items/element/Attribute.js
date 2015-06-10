import Fragment from '../../Fragment';
import Item from '../shared/Item';
import getUpdateDelegate from './attribute/getUpdateDelegate';
import { isArray } from 'utils/is';

export default class Attribute extends Item {
	constructor ( options ) {
		super( options );

		this.name = options.name;
		this.element = options.element;
		this.ractive = options.ractive;
		this.parentFragment = options.element.parentFragment; // shared

		this.updateDelegate = getUpdateDelegate( options );
		this.fragment = null;
		this.value = null;

		if ( !isArray( options.template ) ) {
			this.value = options.template;
		} else {
			this.fragment = new Fragment({
				owner: this,
				template: options.template
			});
		}
	}

	bind () {
		if ( this.fragment ) {
			this.fragment.bind();
			this.value = this.fragment.valueOf();
		}
	}

	render () {
		this.updateDelegate();
	}

	toString () {
		return `${this.name}="${this.value}"`;
	}

	update () {
		this.updateDelegate();
	}
}
