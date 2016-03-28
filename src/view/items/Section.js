import { createDocumentFragment } from '../../utils/dom';
import { SECTION_EACH, SECTION_IF, SECTION_IF_WITH, SECTION_UNLESS, SECTION_WITH } from '../../config/types';
import { isArray, isObject } from '../../utils/is';
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
		this.templateSectionType = this.sectionType;
		this.fragment = null;
	}

	bind () {
		super.bind();

		// if we managed to bind, we need to create children
		if ( this.model ) {
			this.dirty = true;
			this.update();
		} else if (this.sectionType && this.sectionType === SECTION_UNLESS) {
			this.fragment = new Fragment({
				owner: this,
				template: this.template.f
			}).bind();
		}
	}

	detach () {
		return this.fragment ? this.fragment.detach() : createDocumentFragment();
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

	firstNode ( skipParent ) {
		return this.fragment && this.fragment.firstNode( skipParent );
	}

	rebind () {
		super.rebind();

		if ( this.fragment ) {
			this.fragment.rebind( this.sectionType === SECTION_IF || this.sectionType === SECTION_UNLESS ? null : this.model );
		}
	}

	render ( target, occupants ) {
		this.rendered = true;
		if ( this.fragment ) this.fragment.render( target, occupants );
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

	update () {
		if ( !this.dirty ) return;
		if ( !this.model && this.sectionType !== SECTION_UNLESS ) return;

		this.dirty = false;

		const value = !this.model ? undefined : this.model.isRoot ? this.model.value : this.model.get();
		const lastType = this.sectionType;

		// watch for switching section types
		if ( this.sectionType === null || this.templateSectionType === null ) this.sectionType = getType( value, this.template.i );
		if ( lastType && lastType !== this.sectionType && this.fragment ) {
			if ( this.rendered ) {
				this.fragment.unbind().unrender( true );
			}

			this.fragment = null;
		}

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

		// WITH is now IF_WITH; WITH is only used for {{>partial context}}
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
			const fragmentShouldExist = this.sectionType === SECTION_UNLESS ? isEmpty( value ) : !!value && !isEmpty( value );

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
					const docFrag = createDocumentFragment();
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
	}
}
