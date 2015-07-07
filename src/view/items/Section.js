import { SECTION_EACH, SECTION_IF, SECTION_IF_WITH, SECTION_UNLESS, SECTION_WITH } from 'config/types';
import { isArray, isObject } from 'utils/is';
import Fragment from '../Fragment';
import RepeatedFragment from '../RepeatedFragment';
import Mustache from './shared/Mustache';

function isEmpty ( value ) {
	return !value ||
	       ( isArray( value ) && value.length === 0 ) ||
		   ( isObject( value ) && Object.keys( value ).length === 0 );
}

function getType ( value, hasIndexRef ) {
	if ( hasIndexRef || isArray( value ) ) return SECTION_EACH;
	if ( isObject( value ) || typeof value === 'function' ) return SECTION_WITH;
	if ( value === undefined ) return null;
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

			if ( !this.sectionType ) this.sectionType = getType( value, this.template.i );

			if ( isEmpty( value ) && this.sectionType !== SECTION_WITH ) { // TODO again, WITH should not render if empty
				if ( this.sectionType === SECTION_UNLESS ) {
					this.fragment = new Fragment({
						owner: this,
						template: this.template.f
					}).bind();
				}

				// otherwise, create no children
				return;
			}

			if ( this.sectionType === SECTION_UNLESS ) return;

			if ( this.sectionType === SECTION_IF ) {
				fragment = new Fragment({
					owner: this,
					template: this.template.f
				}).bind();
			}

			// TODO should only be WITH, and it should behave like IF_WITH
			else if ( this.sectionType === SECTION_WITH || this.sectionType === SECTION_IF_WITH ) {
				fragment = new Fragment({
					owner: this,
					template: this.template.f
				}).bind( this.model );
			}

			else {
				fragment = new RepeatedFragment({
					owner: this,
					template: this.template.f,
					indexRef: this.template.i
				}).bind( this.model );
			}


			this.fragment = fragment;
		}
	}

	detach () {
		return this.fragment ? this.fragment.detach() : document.createDocumentFragment();
	}

	find ( selector ) {
		if ( this.fragment ) {
			return this.fragment.find( selector );
		}
	}

	findAll ( selector, query ) {
		if ( this.fragment ) {
			this.fragment.findAll( selector, query );
		}
	}

	findComponent ( name ) {
		if ( this.fragment ) {
			return this.fragment.findComponent( name );
		}
	}

	findAllComponents ( name, query ) {
		if ( this.fragment ) {
			this.fragment.findAllComponents( name, query );
		}
	}

	firstNode () {
		return this.fragment && this.fragment.firstNode();
	}

	rebind () {
		super.rebind();

		if ( this.fragment ) {
			this.fragment.rebind( this.sectionType === SECTION_IF ? null : this.model );
		}
	}

	render ( target ) {
		this.rendered = true;
		if ( this.fragment ) this.fragment.render( target );
	}

	shuffle ( newIndices ) {
		if ( this.fragment && this.sectionType === SECTION_EACH ) {
			this.fragment.shuffle( newIndices );
		}
	}

	toString ( escape ) {
		return this.fragment ? this.fragment.toString( escape ) : '';
	}

	unbind () {
		super.unbind();
		if ( this.fragment ) this.fragment.unbind();
	}

	unrender ( shouldDestroy ) {
		if ( this.rendered && this.fragment ) this.fragment.unrender( shouldDestroy );
		this.rendered = false;
	}

	// TODO DRY this out - lot of repeated stuff between this and bind()
	update () {
		if ( !this.dirty ) return;
		if ( !this.model ) return; // TODO can this happen?

		const value = this.model.value;

		if ( this.sectionType === null ) this.sectionType = getType( value, this.template.i );

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

		// TODO same comment as before - WITH should be IF_WITH
		else if ( this.sectionType === SECTION_WITH ) {
			if ( this.fragment ) {
				this.fragment.update();
			} else {
				newFragment = new Fragment({
					owner: this,
					template: this.template.f
				}).bind( this.model );
			}
		}

		else if ( this.sectionType === SECTION_IF_WITH ) {
			if ( this.fragment ) {
				if ( isEmpty( value ) ) {
					if ( this.rendered ) {
						this.fragment.unbind().unrender( true );
					}

					this.fragment = null;
				} else {
					this.fragment.update();
				}
			} else if ( !isEmpty( value ) ) {
				newFragment = new Fragment({
					owner: this,
					template: this.template.f
				}).bind( this.model );
			}
		}

		else {
			const fragmentShouldExist = this.sectionType === SECTION_UNLESS ? isEmpty( value ) : !!value;

			if ( this.fragment ) {
				if ( fragmentShouldExist ) {
					this.fragment.update();
				} else {
					if ( this.rendered ) {
						this.fragment.unbind().unrender( true );
					}

					this.fragment = null;
				}
			} else if ( fragmentShouldExist ) {
				newFragment = new Fragment({
					owner: this,
					template: this.template.f
				}).bind( null );
			}
		}

		if ( newFragment ) {
			if ( this.rendered ) {
				const parentNode = this.parentFragment.findParentNode();
				const anchor = this.parentFragment.findNextNode( this );

				if ( anchor ) {
					const docFrag = document.createDocumentFragment();
					newFragment.render( docFrag );

					// we use anchor.parentNode, not parentNode, because the sibling
					// may be temporarily detached as a result of a shuffle
					anchor.parentNode.insertBefore( docFrag, anchor );
				} else {
					newFragment.render( parentNode );
				}
			}

			this.fragment = newFragment;
		}

		this.dirty = false;
	}
}
