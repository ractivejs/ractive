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
			let len = currentLength - newLength, i, unrender;

			unrender = section.fragmentsToUnrender = section.fragments.splice( newLength, len );

			for ( i = 0; i < len; i++ ) {
				unrender[i].unbind();
			}
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

		if ( len = removed.length ) {
			for( let i = 0; i < len; i++ ) {
				removed[i].unbind();
			}
		}

		if ( splice.insertCount !== splice.deleteCount ) {
			section.length = fragments.length;
		}
	}

	mergeMembers () {

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

	unrender () {
		this.setMembers( { members: [] } );
	}
}



export default EachBlock;
