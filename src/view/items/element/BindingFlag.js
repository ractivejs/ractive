import Item from '../shared/Item';
import Fragment from '../../Fragment';
import findElement from '../shared/findElement';
import { INTERPOLATOR, ELEMENT } from '../../../config/types';
import { isArray } from '../../../utils/is';

export default class BindingFlag extends Item {
	constructor ( options ) {
		super( options );

		this.owner = options.owner || options.parentFragment.owner || findElement( options.parentFragment );
		this.element = this.owner.attributeByName ? this.owner : findElement( options.parentFragment );
		this.flag = options.template.v === 'l' ? 'lazy' : 'twoway';

		if ( this.element.type === ELEMENT ) {
			if ( !isArray( options.template.f ) ) {
				set( this, 'f' in options.template ? options.template.f : true, false );
			} else {
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

	getValue () { return this.fragment ? this.fragment.valueOf() : this.value; }

	rebind () {
		this.unbind();
		this.bind();
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

	if ( update && !flag.element.attributes.binding && flag.element[ flag.flag ] !== flag.value ) {
		flag.element.recreateTwowayBinding();
	}
	flag.element[ flag.flag ] = flag.value;

	return flag.value;
}
