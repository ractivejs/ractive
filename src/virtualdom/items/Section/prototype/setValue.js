import { SECTION_EACH, SECTION_IF, SECTION_UNLESS, SECTION_WITH, SECTION_IF_WITH } from 'config/types';
import { isArrayLike, isObject } from 'utils/is';
import { unbind } from 'shared/methodCallers';
import runloop from 'global/runloop';
import Fragment from 'virtualdom/Fragment';
import EachBlock from '../blocks/EachBlock'

export default function Section$setValue ( value ) {
	var wrapper, fragmentOptions;

	if ( this.updating ) {
		// If a child of this section causes a re-evaluation - for example, an
		// expression refers to a function that mutates the array that this
		// section depends on - we'll end up with a double rendering bug (see
		// https://github.com/ractivejs/ractive/issues/748). This prevents it.
		return;
	}

	this.updating = true;

	// with sections, we need to get the fake value if we have a wrapped object
	if ( this.keypath && ( wrapper = this.keypath.wrapper ) ) {
		value = wrapper.get();
	}

	// If any fragments are awaiting creation after a splice,
	// this is the place to do it
	if ( this.fragmentsToCreate.length ) {
		fragmentOptions = {
			template: this.template.f || [],
			root:     this.root,
			pElement: this.pElement,
			owner:    this
		};

		this.fragmentsToCreate.forEach( index => {
			var fragment;

			debugger;
			fragmentOptions.context = this.keypath.join( index );
			fragmentOptions.index = index;

			fragment = new Fragment( fragmentOptions );
			this.fragmentsToRender.push( this.fragments[ index ] = fragment );
		});

		this.fragmentsToCreate.length = 0;
	}

	else if ( reevaluateSection( this, value ) ) {
		this.bubble();

		if ( this.rendered ) {
			runloop.addView( this );
		}
	}

	this.value = value;
	this.updating = false;
}

function changeCurrentSubtype ( section, value, obj ) {
	if ( value === SECTION_EACH ) {
		// make sure ref type is up to date for key or value indices
		if ( section.indexRefs && section.indexRefs[0] ) {
			let ref = section.indexRefs[0];

			// when switching flavors, make sure the section gets updated
			if ( ( obj && ref.t === 'i' ) || ( !obj && ref.t === 'k' ) ) {
				// if switching from object to list, unbind all of the old fragments
				if ( !obj ) {
					section.length = 0;
				  section.fragmentsToUnrender = section.fragments.slice( 0 );
					section.fragmentsToUnrender.forEach( f => f.unbind() );
				}
			}

			// ref.t = obj ? 'k' : 'i';
		}
	}

	section.currentSubtype = value;
}

function reevaluateSection ( section, value ) {
	var fragmentOptions = {
		template: section.template.f || [],
		root:     section.root,
		pElement: section.parentFragment.pElement,
		owner:    section
	};

	section.hasContext = true;

	// If we already know the section type, great
	// TODO can this be optimised? i.e. pick an reevaluateSection function during init
	// and avoid doing this each time?
	if ( section.subtype ) {
		switch ( section.subtype ) {
			case SECTION_IF:
			section.hasContext = false;
			return reevaluateConditionalSection( section, value, false, fragmentOptions );

			case SECTION_UNLESS:
			section.hasContext = false;
			return reevaluateConditionalSection( section, value, true, fragmentOptions );

			case SECTION_WITH:
			return reevaluateContextSection( section, fragmentOptions );

			case SECTION_IF_WITH:
			return reevaluateConditionalContextSection( section, value, fragmentOptions );

			case SECTION_EACH:
			if ( isObject( value ) ) {
				return createObjectEachBlock( section, fragmentOptions );
			}

			// Fallthrough - if it's a conditional or an array we need to continue
		}
	}

	// Otherwise we need to work out what sort of section we're dealing with
	section.ordered = !!isArrayLike( value );

	// Ordered list section
	if ( section.ordered ) {
		return createListEachBlock( section, fragmentOptions );
	}

	// Unordered list, or context
	if ( isObject( value ) || typeof value === 'function' ) {

		let indices = section.indices;
		if ( indices && indices.length ) {
			return createObjectEachBlock( section, fragmentOptions );
		}
		else {
			changeCurrentSubtype( section, SECTION_WITH, false );
			return reevaluateContextSection( section, fragmentOptions );
		}
	}

	// Conditional section
	changeCurrentSubtype( section, SECTION_IF, false );
	section.hasContext = false;
	return reevaluateConditionalSection( section, value, false, fragmentOptions );
}

function createAliases ( section, specials ) {
	let indices, aliases;
	if ( indices = section.indices ) {
		aliases = {};
		if ( indices[0] ) {
			aliases[ indices[0] ] = specials[0]
		}
		if ( indices[1] ) {
			aliases[ indices[1] ] = specials[1]
		}
	}
	return aliases;
}

function createListEachBlock ( section, fragmentOptions, aliases ) {
	var aliases = createAliases( section, [ '@index', '@index' ] );
	return createEachBlock( section, 'list', fragmentOptions, aliases );
}

function createObjectEachBlock ( section, fragmentOptions, aliases ) {
	var aliases = createAliases( section, [ '@key', '@index' ] );
	return createEachBlock( section, 'hash', fragmentOptions, aliases );
}

function createEachBlock ( section, type, fragmentOptions, aliases ) {
	var block = section.block;

	// Already an EachBlock?
	if ( block && block instanceof EachBlock ) {
		// just keep using same block
		if ( block.type === type ) {
			return false;
		}
		// unrender fragments, we'll start over with new EachBlock...
		else {
			block.unrender();
		}
	}

	block = section.block = new EachBlock( section, type, fragmentOptions, aliases );

	section.context.listRegister( block );

	return false;
}

function reevaluateConditionalContextSection ( section, value, fragmentOptions ) {
	if ( value ) {
		return reevaluateContextSection( section, fragmentOptions );
	} else {
		return removeSectionFragments( section );
	}
}

function reevaluateContextSection ( section, fragmentOptions ) {
	var fragment;

	// ...then if it isn't rendered, render it, adding section.context to the context stack
	// (if it is already rendered, then any children dependant on the context stack
	// will update themselves without any prompting)
	if ( !section.length ) {

		// TODO model needs to handle this...

		// append this section to the context stack
		fragmentOptions.context = section.context;
		fragmentOptions.index = 0;

		fragment = new Fragment( fragmentOptions );

		section.fragmentsToRender.push( section.fragments[0] = fragment );
		section.length = 1;

		return true;
	}
}

function reevaluateConditionalSection ( section, value, inverted, fragmentOptions ) {
	var doRender, emptyArray, emptyObject, fragment, name;

	emptyArray = ( isArrayLike( value ) && value.length === 0 );
	emptyObject = false;
	if( !isArrayLike( value ) && isObject( value ) ) {
		emptyObject = true;
		for( name in value ) {
			emptyObject = false;
			break;
		}
	}

	if ( inverted ) {
		doRender = emptyArray || emptyObject || !value;
	} else {
		doRender = value && !emptyArray && !emptyObject;
	}

	if ( doRender ) {
		if ( !section.length ) {
			// no change to context stack
			fragmentOptions.index = 0;

			fragment = new Fragment( fragmentOptions );
			section.fragmentsToRender.push( section.fragments[0] = fragment );
			section.length = 1;

			return true;
		}

		if ( section.length > 1 ) {
			section.fragmentsToUnrender = section.fragments.splice( 1 );
			section.fragmentsToUnrender.forEach( unbind );

			return true;
		}
	}

	else {
		return removeSectionFragments( section );
	}
}

function removeSectionFragments ( section ) {
	if ( section.length ) {
		section.fragmentsToUnrender = section.fragments.splice( 0, section.fragments.length ).filter( isRendered );
		section.fragmentsToUnrender.forEach( unbind );
		section.length = section.fragmentsToRender.length = 0;
		return true;
	}
}

function isRendered ( fragment ) {
	return fragment.rendered;
}

function blindRebind ( dep ) {
	// the keypath doesn't actually matter here as it won't have changed
	dep.rebind( '', '' );
}
