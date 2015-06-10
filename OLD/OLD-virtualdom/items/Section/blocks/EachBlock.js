import AliasWrapper from './AliasWrapper';
import Fragment from 'virtualdom/Fragment';
import runloop from 'global/runloop';
import { unbind } from 'shared/methodCallers';

class EachBlock {

	constructor ( section, type, fragmentOptions, aliases ) {
		this.type = type;
		this.section = section;
		this.fragmentOptions = fragmentOptions;
		this.aliases = aliases;
		this.members = null;
		this.merging = false;
	}

	updateSection () {
		const section = this.section;
		section.bubble();
		if ( section.rendered ) {
			runloop.addView( section );
		}
	}

	setValue () {
		console.log( 'this', this )
	}

	setMembers ( shuffle ) {
		const section = this.section,
			  fragments = section.fragments;

	    // Nothing to shuffle against, so act on members
		if ( !fragments || !fragments.length ) {
			this.createMembers( shuffle.members );
		}
		// merge operation
		else if ( shuffle.mergeMap ) {
			this.mergeMembers( shuffle );
		}
		// splice operation
		else if ( shuffle.splice ) {
			this.spliceMembers( shuffle )
		}
		// reset of members
		else {
			this.createMembers( shuffle.members );
		}
	}

	createMembers ( members ) {
		const section = this.section,
			  currentLength = section.length,
			  newLength = members.length;

		// length is same? nothing to do
		if ( newLength === currentLength ) {
			return;
		}

		// shorter? remove items
		if ( newLength < currentLength ) {
			const len = currentLength - newLength,
				  unrender = section.fragmentsToUnrender = section.fragments.splice( newLength, len );

			this.unbindFragments( unrender );
		}

		// longer? add new ones
		else {
			let i, toSplice, fragments = section.fragments;

			// fragments.length = newLength

			if ( section.rendered ) {
				toSplice = new Array(newLength - currentLength + 2)
				toSplice[0] = currentLength;
				toSplice[1] = 0;
			}

			for ( i = currentLength; i < newLength; i += 1 ) {
				fragments[i] = this.createFragment( members[i] );
				if ( toSplice ) {
					toSplice[ i - currentLength + 2 ] = fragments[i];
				}
			}

			if ( toSplice ) {
				section.fragmentsToSplice = toSplice;
			}
		}

		section.length = newLength;

		this.updateSection();
	}

	spliceMembers ( shuffle ) {
		const section = this.section,
			  fragments = section.fragments,
			  members = shuffle.members,
			  splice = shuffle.splice,
			  args = new Array( 2 + splice.insertCount );

		var removed, len;

		args[0] = splice.start;
		args[1] = splice.deleteCount;

		if ( splice.insertCount ) {
			let arg = 2,
				i = splice.start,
				end = splice.start + splice.insertCount;

			while ( i < end ) {
				args[ arg ] = this.createFragment( members[i], i );
				i++;
				arg++;
			}

			section.fragmentsToSplice = args;
		}

		removed = section.fragmentsToUnrender = fragments.splice.apply( fragments, args );

		this.unbindFragments( removed );

		if ( splice.insertCount !== splice.deleteCount ) {
			section.length = fragments.length;
		}

		this.updateSection();
	}

	mergeMembers ( shuffle ) {
		const section = this.section,
			  oldFragments = section.fragmentsToUnrender = section.fragments,
			  members = shuffle.members,
			  mergeMap = section.mergeMap = shuffle.mergeMap,
			  newFragments = section.fragments = [];

		for ( let i = 0, l = mergeMap.length; i < l; i++ ) {
			let existing = mergeMap[i];
			// no mapped fragment to merge
			if ( existing === -1 ) {
				newFragments[i] = this.createFragment( members[i], i );
			}
			// reuse existing fragment
			else {
				newFragments[i] = oldFragments[ existing ];
				oldFragments[ existing ] = null;
			}
		}

		// unbind any non-reused fragments...
		this.unbindFragments( oldFragments );

		this.updateSection();
	}

	createFragment ( context, index ) {
		const fragmentOptions = this.fragmentOptions;

		if ( this.aliases ) {
			context = new AliasWrapper( context, this.aliases );
		}

		// append list item to context stack
		fragmentOptions.context = context;
		// TODO: See if this is still needed
		fragmentOptions.index = index;

		return new Fragment( fragmentOptions );

	}

	unbindFragments( removed ) {
		var fragment;
		for( let i = 0, l = removed.length; i < l; i++ ) {
			fragment = removed[i];
			if ( fragment ) {
				fragment.unbind();
			}
		}
	}

	unrender () {
		this.setMembers( { members: [] } );
	}
}



export default EachBlock;
