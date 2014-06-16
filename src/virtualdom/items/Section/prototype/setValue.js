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
	var wrapper;

	// with sections, we need to get the fake value if we have a wrapped object
	if ( wrapper = this.root.viewmodel.wrapped[ this.keypath ] ) {
		value = wrapper.get();
	}

	if ( reevaluateSection( this, value ) ) {
		this.bubble();

		if ( this.rendered ) {
			runloop.addView( this );
		}
	}

	this.value = value;
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
	if ( section.template.n ) {
		switch ( section.template.n ) {
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

	// otherwise we need to work out what sort of section we're dealing with

	// if value is an array, or an object with an index reference, iterate through
	if ( isArray( value ) ) {
		return reevaluateListSection( section, value, fragmentOptions );
	}


	// if value is a hash...
	if ( isObject( value ) || typeof value === 'function' ) {
		if ( section.template.i ) {
			return reevaluateListObjectSection( section, value, fragmentOptions );
		}

		return reevaluateContextSection( section, fragmentOptions );
	}


	// otherwise render if value is truthy, unrender if falsy
	return reevaluateConditionalSection( section, value, false, fragmentOptions );
}

function reevaluateListSection ( section, value, fragmentOptions ) {
	var i, length, fragment, fragmentsToRemove;

	length = value.length;

	if ( length === section.length ) {
		// Nothing to do
		return false;
	}

	// if the array is shorter than it was previously, remove items
	if ( length < section.length ) {
		fragmentsToRemove = section.fragments.splice( length, section.length - length );
		fragmentsToRemove.forEach( unrenderAndTeardown );
	}

	// otherwise...
	else {

		if ( length > section.length ) {
			// add any new ones
			for ( i=section.length; i<length; i+=1 ) {
				// append list item to context stack
				fragmentOptions.context = section.keypath + '.' + i;
				fragmentOptions.index = i;

				if ( section.template.i ) {
					fragmentOptions.indexRef = section.template.i;
				}

				fragment = new Fragment( fragmentOptions );
				section.unrenderedFragments.push( section.fragments[i] = fragment );
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

			unrenderAndTeardown( section.fragments[i] );
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

			section.unrenderedFragments.push( fragment );
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

		section.unrenderedFragments.push( section.fragments[0] = fragment );
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
			section.unrenderedFragments.push( section.fragments[0] = fragment );
			section.length = 1;

			return true;
		}

		if ( section.length > 1 ) {
			section.fragments.splice( 1 ).forEach( unrenderAndTeardown );

			return true;
		}
	}

	else if ( section.length ) {
		section.fragments.splice( 0 ).forEach( unrenderAndTeardown );
		section.length = 0;

		return true;
	}
}

function unrenderAndTeardown ( fragment ) {
	// TODO in future, we shouldn't need to do this check as
	// changes will fully propagate before the virtual DOM
	// is updated
	if ( fragment.rendered ) {
		fragment.unrender( true );
	}

	fragment.teardown();
}
