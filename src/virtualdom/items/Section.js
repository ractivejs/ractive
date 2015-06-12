import { SECTION_EACH, SECTION_IF, SECTION_UNLESS, SECTION_WITH } from 'config/types';
import { isArray, isObject } from 'utils/is';
import findParentNode from './shared/findParentNode';
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
		if ( this.fragment && this.sectionType === SECTION_EACH ) {
			this.fragment.shuffle( newIndices );
		}
	}

	toString ( escape ) {
		return this.fragment ? this.fragment.toString( escape ) : '';
	}

	// TODO DRY this out - lot of repeated stuff between this and bind()
	update () {
		if ( !this.dirty ) return;
		if ( !this.model ) return; // TODO can this happen?

		const value = this.model.value;

		if ( this.sectionType === null ) this.sectionType = getType( value );

		let newFragment;

		if ( this.sectionType === SECTION_EACH ) {
			if ( this.fragment ) {
				this.fragment.update();
			} else {
				// TODO can this happen?
				newFragment = new RepeatedFragment({
					owner: this,
					template: this.template.f,
					indexRef: this.template.i
				}).bind( this.model );
			}
		}

		else if ( this.sectionType === SECTION_WITH ) {
			// TODO remove fragments if value is null or empty object
			if ( this.fragment ) {
				this.fragment.update();
			} else {
				this.fragment = new Fragment({
					owner: this,
					template: this.template.f
				}).bind( this.model );
			}
		}

		else {
			if ( this.fragment ) {
				if ( !!value ) {
					this.fragment.update();
				} else {
					this.fragment.unbind().unrender( true );
					this.fragment = null;
				}
			} else if ( value ) {
				newFragment = new Fragment({
					owner: this,
					template: this.template.f
				}).bind( null );
			}
		}

		if ( newFragment ) {
			findParentNode( this ).insertBefore( newFragment.render(), this.parentFragment.findNextNode( this ) );
			this.fragment = newFragment;
		}

		this.dirty = false;
	}
}
