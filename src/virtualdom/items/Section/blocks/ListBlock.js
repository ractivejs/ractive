import Fragment from 'virtualdom/Fragment';
import runloop from 'global/runloop';
import { unbind } from 'shared/methodCallers';

class ListBlock {
	constructor ( section, fragmentOptions ) {
		this.section = section;
		this.fragmentOptions = fragmentOptions;
	}

	setMembers ( members ) {
		var i, length, fragment, section, fragmentOptions;

		section = this.section;
		fragmentOptions = this.fragmentOptions;
		length = members.length;

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
					fragmentOptions.context = members[ i ]; //section.keypath.indexJoin( i, section.indexRefs );
					fragmentOptions.index = i;

					fragment = new Fragment( fragmentOptions );
					section.fragmentsToRender.push( section.fragments[i] = fragment );
				}
			}
		}

		section.length = length;

		// TODO: see how this shakes out,
		// probably a method on section.
		// or maybe something else
		section.bubble();

		if ( section.rendered ) {
			runloop.addView( section );
		}
	}

	updateMembers ( splice ) {
		console.log( splice );
	}
}

export default ListBlock;
