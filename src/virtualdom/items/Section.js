import { SECTION_EACH, SECTION_IF, SECTION_UNLESS, SECTION_WITH } from 'config/types';
import { isArray, isObject } from 'utils/is';
import Fragment from '../Fragment';
import RepeatedFragment from '../RepeatedFragment';
import Mustache from './shared/Mustache';

let emptyFragment;

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

			if ( this.sectionType === SECTION_UNLESS ) return;

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
				fragment = new RepeatedFragment({
					owner: this,
					template: this.template.f,
					indexRef: this.template.i
				});

				fragment.bind( this.model );
			}


			this.fragment = fragment;
		}

		// if not, we only need to create children if this is an 'unless' block
	}

	find ( selector ) {
		if ( this.fragment ) {
			return this.fragment.find( selector );
		}
	}

	findAll ( selector, queryResult ) {
		if ( this.fragment ) {
			this.fragment.findAll( selector, queryResult );
		}
	}

	findComponent ( name ) {
		if ( this.fragment ) {
			return this.fragment.findComponent( name );
		}
	}

	findAllComponents ( name, queryResult ) {
		if ( this.fragment ) {
			this.fragment.findAllComponents( name, queryResult );
		}
	}

	findNextNode () {
		return this.parentFragment.findNextNode( this );
	}

	firstNode () {
		return this.fragment.firstNode();
	}

	render () {
		return this.fragment ?
			this.fragment.render() :
			( emptyFragment || ( emptyFragment = document.createDocumentFragment() ) );
	}

	shuffle ( newIndices ) {
		if ( this.fragment ) {
			this.fragment.shuffle( newIndices );
		}
	}

	toString ( escape ) {
		return this.fragment ? this.fragment.toString( escape ) : '';
	}

	update () {
		if ( this.dirty ) {
			if ( this.fragment ) {
				this.fragment.update();
			}

			this.dirty = false;
		}
	}
}
