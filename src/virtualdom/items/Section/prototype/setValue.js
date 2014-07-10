import types from 'config/types';
import isArray from 'utils/isArray';
import isObject from 'utils/isObject';
import runloop from 'global/runloop';

import circular from 'circular';

var Fragment;

circular.push( function () {
	Fragment = circular.Fragment;
});

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
	if ( wrapper = this.root.viewmodel.wrapped[ this.keypath ] ) {
		value = wrapper.get();
	}

	// If any fragments are awaiting creation after a splice,
	// this is the place to do it
	if ( this.fragmentsToCreate.length ) {
		fragmentOptions = {
			template: this.template.f,
			root:     this.root,
			pElement: this.pElement,
			owner:    this,
			indexRef: this.template.i
		};

		this.fragmentsToCreate.forEach( index => {
			var fragment;

			fragmentOptions.context = this.keypath + '.' + index;
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
			case types.SECTION_IF:
			return reevaluateConditionalSection( section, value, false, fragmentOptions );

			case types.SECTION_UNLESS:
			return reevaluateConditionalSection( section, value, true, fragmentOptions );

			case types.SECTION_WITH:
			return reevaluateContextSection( section, fragmentOptions );

			case types.SECTION_EACH:
			if ( isObject( value ) ) {
				return reevaluateListObjectSection( section, value, fragmentOptions );
			}

			// Fallthrough - if it's a conditional or an array we need to continue
		}
	}

	// Otherwise we need to work out what sort of section we're dealing with
	section.ordered = !!isArray( value );

	// Ordered list section
	if ( section.ordered ) {
		return reevaluateListSection( section, value, fragmentOptions );
	}

	// Unordered list, or context
	if ( isObject( value ) || typeof value === 'function' ) {
		// Index reference indicates section should be treated as a list
		if ( section.template.i ) {
			return reevaluateListObjectSection( section, value, fragmentOptions );
		}

		// Otherwise, object provides context for contents
		return reevaluateContextSection( section, fragmentOptions );
	}

	// Conditional section
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
				fragmentOptions.context = section.keypath + '.' + i;
				fragmentOptions.index = i;

				if ( section.template.i ) {
					fragmentOptions.indexRef = section.template.i;
				}

				fragment = new Fragment( fragmentOptions );
				section.fragmentsToRender.push( section.fragments[i] = fragment );
			}
		}
	}

	section.length = length;
	return true;
}

function reevaluateListObjectSection ( section, value, fragmentOptions ) {
	var id, i, hasKey, fragment, changed;

	hasKey = section.hasKey || ( section.hasKey = {} );

	// remove any fragments that should no longer exist
	i = section.fragments.length;
	while ( i-- ) {
		fragment = section.fragments[i];

		if ( !( fragment.index in value ) ) {
			changed = true;

			fragment.unbind();
			section.fragmentsToUnrender.push( fragment );
			section.fragments.splice( i, 1 );

			hasKey[ fragment.index ] = false;
		}
	}

	// add any that haven't been created yet
	for ( id in value ) {
		if ( !hasKey[ id ] ) {
			changed = true;

			fragmentOptions.context = section.keypath + '.' + id;
			fragmentOptions.index = id;

			if ( section.template.i ) {
				fragmentOptions.indexRef = section.template.i;
			}

			fragment = new Fragment( fragmentOptions );

			section.fragmentsToRender.push( fragment );
			section.fragments.push( fragment );
			hasKey[ id ] = true;
		}
	}

	section.length = section.fragments.length;
	return changed;
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
	var doRender, emptyArray, fragment;

	emptyArray = ( isArray( value ) && value.length === 0 );

	if ( inverted ) {
		doRender = emptyArray || !value;
	} else {
		doRender = value && !emptyArray;
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

	else if ( section.length ) {
		section.fragmentsToUnrender = section.fragments.splice( 0, section.fragments.length );
		section.fragmentsToUnrender.forEach( unbind );
		section.length = 0;

		return true;
	}
}

function unbind ( fragment ) {
	fragment.unbind();
}
