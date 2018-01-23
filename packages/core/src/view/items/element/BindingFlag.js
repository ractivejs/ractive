import Item from '../shared/Item';
import Fragment from '../../Fragment';
import findElement from '../shared/findElement';
import { INTERPOLATOR, ELEMENT } from '../../../config/types';

export default class BindingFlag extends Item {
	constructor ( options ) {
		super( options );

		this.owner = options.owner || options.parentFragment.owner || findElement( options.parentFragment );
		this.element = this.owner.attributeByName ? this.owner : findElement( options.parentFragment );
		this.flag = options.template.v === 'l' ? 'lazy' : 'twoway';

		if ( this.element.type === ELEMENT ) {
			if ( Array.isArray( options.template.f ) ) {
				this.fragment = new Fragment({
					owner: this,
					template: options.template.f
				});
			}

			this.interpolator = this.fragment &&
								this.fragment.items.length === 1 &&
								this.fragment.items[0].type === INTERPOLATOR &&
								this.fragment.items[0];
		}
	}

	bind () {
		if ( this.fragment ) this.fragment.bind();
		set( this, this.getValue(), true );
	}

	bubble () {
		if ( !this.dirty ) {
			this.element.bubble();
			this.dirty = true;
		}
	}

	getValue () {
		if ( this.fragment ) return this.fragment.valueOf();
		else if ( 'value' in this ) return this.value;
		else if ( 'f' in this.template ) return this.template.f;
		else return true;
	}

	render () {
		set( this, this.getValue(), true );
	}

	toString () { return ''; }

	unbind () {
		if ( this.fragment ) this.fragment.unbind();

		delete this.element[ this.flag ];
	}

	unrender () {
		if ( this.element.rendered ) this.element.recreateTwowayBinding();
	}

	update () {
		if ( this.dirty ) {
			if ( this.fragment ) this.fragment.update();
			set( this, this.getValue(), true );
		}
	}
}

function set ( flag, value, update ) {
	if ( value === 0 ) {
		flag.value = true;
	} else if ( value === 'true' ) {
		flag.value = true;
	} else if ( value === 'false' || value === '0' ) {
		flag.value = false;
	} else {
		flag.value = value;
	}

	const current = flag.element[ flag.flag ];
	flag.element[ flag.flag ] = flag.value;
	if ( update && !flag.element.attributes.binding && current !== flag.value ) {
		flag.element.recreateTwowayBinding();
	}

	return flag.value;
}
