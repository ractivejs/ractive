import { SECTION_EACH, SECTION_IF, SECTION_UNLESS, SECTION_WITH, SECTION_IF_WITH } from 'config/types';
import { isArrayLike, isObject } from 'utils/is';
import { unbind } from 'shared/methodCallers';
import runloop from 'global/runloop';
import Fragment from 'virtualdom/Fragment';

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
	if ( this.keypath && ( wrapper = this.root.viewmodel.wrapped[ this.keypath.str ] ) ) {
		value = wrapper.get();
	}

	// If any fragments are awaiting creation after a splice,
	// this is the place to do it
	if ( this.fragmentsToCreate.length ) {
		fragmentOptions = {
			template: this.template.f,
			root:     this.root,
			pElement: this.pElement,
			owner:    this
		};

		this.fragmentsToCreate.forEach( index => {
			var fragment;

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

			ref.t = obj ? 'k' : 'i';
		}
	}

	section.currentSubtype = value;
}

function reevaluateSection ( section, value ) {
	var fragmentOptions = {
		template: section.template.f,
		root:       section.root,
		pElement:   section.parentFragment.pElement,
		owner:      section
	};

	// If we already know the section type, great
	// TODO can this be optimised? i.e. pick an reevaluateSection function during init
	// and avoid doing this each time?
	if ( section.subtype ) {
		switch ( section.subtype ) {
			case SECTION_IF:
			return reevaluateConditionalSection( section, value, false, fragmentOptions );

			case SECTION_UNLESS:
			return reevaluateConditionalSection( section, value, true, fragmentOptions );

			case SECTION_WITH:
			return reevaluateContextSection( section, fragmentOptions );

			case SECTION_IF_WITH:
			return reevaluateConditionalContextSection( section, value, fragmentOptions );

			case SECTION_EACH:
			if ( isObject( value ) ) {
				changeCurrentSubtype( section, section.subtype, true );
				return reevaluateListObjectSection( section, value, fragmentOptions );
			}

			// Fallthrough - if it's a conditional or an array we need to continue
		}
	}

	// Otherwise we need to work out what sort of section we're dealing with
	section.ordered = !!isArrayLike( value );

	// Ordered list section
	if ( section.ordered ) {
		changeCurrentSubtype( section, SECTION_EACH, false );
		return reevaluateListSection( section, value, fragmentOptions );
	}

	// Unordered list, or context
	if ( isObject( value ) || typeof value === 'function' ) {
		// Index reference indicates section should be treated as a list
		if ( section.template.i ) {
			changeCurrentSubtype( section, SECTION_EACH, true );
			return reevaluateListObjectSection( section, value, fragmentOptions );
		}

		// Otherwise, object provides context for contents
		changeCurrentSubtype( section, SECTION_WITH, false );
		return reevaluateContextSection( section, fragmentOptions );
	}

	// Conditional section
	changeCurrentSubtype( section, SECTION_IF, false );
	return reevaluateConditionalSection( section, value, false, fragmentOptions );
}

function reevaluateListSection ( section, value, fragmentOptions ) {
	var i, length, fragment;

	length = value.length;

	if ( length === section.length ) {
		// Nothing to do
		return false;
	}

	// if the array is shorter than it was previously, remove items
	if ( length < section.length ) {
		section.fragmentsToUnrender = section.fragments.splice( length, section.length - length );
		section.fragmentsToUnrender.forEach( unbind );
	}

	// otherwise...
	else {
		if ( length > section.length ) {
			// add any new ones
			for ( i = section.length; i < length; i += 1 ) {
				// append list item to context stack
				fragmentOptions.context = section.keypath.join( i );
				fragmentOptions.index = i;

				fragment = new Fragment( fragmentOptions );
				section.fragmentsToRender.push( section.fragments[i] = fragment );
			}
		}
	}

	section.length = length;
	return true;
}

function reevaluateListObjectSection ( section, value, fragmentOptions ) {
	var id, i, hasKey, fragment, changed, deps;

	hasKey = section.hasKey || ( section.hasKey = {} );

	// remove any fragments that should no longer exist
	i = section.fragments.length;
	while ( i-- ) {
		fragment = section.fragments[i];

		if ( !( fragment.key in value ) ) {
			changed = true;

			fragment.unbind();
			section.fragmentsToUnrender.push( fragment );
			section.fragments.splice( i, 1 );

			hasKey[ fragment.key ] = false;
		}
	}

	// notify any dependents about changed indices
	i = section.fragments.length;
	while ( i-- ) {
		fragment = section.fragments[i];

		if ( fragment.index !== i ){
			fragment.index = i;
			if ( deps = fragment.registeredIndexRefs ) {
				deps.forEach( blindRebind );
			}
		}
	}

	// add any that haven't been created yet
	i = section.fragments.length;
	for ( id in value ) {
		if ( !hasKey[ id ] ) {
			changed = true;

			fragmentOptions.context = section.keypath.join( id );
			fragmentOptions.key = id;
			fragmentOptions.index = i++;

			fragment = new Fragment( fragmentOptions );

			section.fragmentsToRender.push( fragment );
			section.fragments.push( fragment );
			hasKey[ id ] = true;
		}
	}

	section.length = section.fragments.length;
	return changed;
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

	// ...then if it isn't rendered, render it, adding section.keypath to the context stack
	// (if it is already rendered, then any children dependent on the context stack
	// will update themselves without any prompting)
	if ( !section.length ) {
		// append this section to the context stack
		fragmentOptions.context = section.keypath;
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
