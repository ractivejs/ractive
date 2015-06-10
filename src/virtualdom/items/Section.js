import { SECTION_EACH, SECTION_IF, SECTION_UNLESS, SECTION_WITH } from 'config/types';
import { isArray, isObject } from 'utils/is';
import Fragment from '../Fragment';
import Mustache from './shared/Mustache';
import initialiseMustache from './shared/initialiseMustache';

function getType ( value ) {
	if ( isArray( value ) ) return SECTION_EACH;
	if ( isObject( value ) ) return SECTION_WITH;
	return SECTION_IF;
}

export default class Section extends Mustache {
	constructor ( options ) {
		super( options );

		this.sectionType = options.template.n || null;
		this.fragment = null;
	}

	bind () {
		super.bind();

		// if we managed to bind, we need to create children
		if ( this.model ) {
			const value = this.model.value;
			let fragment;

			if ( !this.sectionType ) this.sectionType = getType( value );

			if ( !value ) {
				if ( this.sectionType === SECTION_UNLESS ) {
					this.fragment = new Fragment({
						owner: this,
						template: this.template.f
					});

					this.fragment.bind();
				}

				// otherwise, create no children
				return;
			}

			if ( this.sectionType === SECTION_IF ) {
				fragment = new Fragment({
					owner: this,
					template: this.template.f
				});

				fragment.bind();
			}

			else if ( this.sectionType === SECTION_WITH ) {
				fragment = new Fragment({
					owner: this,
					template: this.template.f
				});

				fragment.bind( this.model );
			}

			else {
				throw new Error( '#each sections not implemented' );
			}


			this.fragment = fragment;
		}

		// if not, we only need to create children if this is an 'unless' block
	}

	render () {
		return this.fragment.render();
	}

	toString () {
		return this.fragment.toString();
	}
}
