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
	}

	setMembers ( members ) {
		var i, length, fragment, section, aliases, fragmentOptions, context, _get;

		this.members = members;
		section = this.section;
		fragmentOptions = this.fragmentOptions;
		aliases = this.aliases;
		length = members.length;

		if ( length === section.length ) {
			// Nothing to do
			return false;
		}

		// if the array is shorter than it was previously, remove items
		if ( length < section.length ) {
			this.removeFragments( length, section.length - length );
		}

		// otherwise...
		else {
			if ( length > section.length ) {
				// add any new ones
				for ( i = section.length; i < length; i += 1 ) {
					this.createFragment( i );
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

	createFragment ( index ) {
		var context = this.members[ index ],
			fragmentOptions = this.fragmentOptions,
			section = this.section,
			fragment;

		if ( this.aliases ) {
			context = new AliasWrapper( context, this );
		}

		// append list item to context stack
		fragmentOptions.context = context;
		// TODO: I don't think this will be needed
		// and can be deleted
		fragmentOptions.index = index;

		fragment = new Fragment( fragmentOptions );
		section.fragmentsToRender.push( section.fragments[ index ] = fragment );
	}

	removeFragments ( start, length ) {
		var section = this.section;
		section.fragmentsToUnrender = section.fragments.splice( start, length );
		section.fragmentsToUnrender.forEach( unbind );
	}

	unrender () {
		this.setMembers( [] );
	}

	updateMembers ( splice ) {
		var section = this.section;

		if ( splice.remove ) {
			this.removeFragments( splice.start, splice.remove );
		}

		if ( splice.insert ) {
			let i = splice.start,
				end = splice.start + splice.insert;

			while ( i < end ) {
				this.createFragment( i );
				i++;
			}
		}

		if ( splice.insert !== splice.remove ) {
			section.length += ( splice.insert - splice.remove );
		}

		// TODO: see how this shakes out,
		// probably a method on section.
		// or maybe something else
		section.bubble();

		if ( section.rendered ) {
			runloop.addView( section );
		}
	}
}

class AliasWrapper {
	constructor ( context, block ) {
		this.context = context;
		this.block = block;
	}

	alias ( keypath ) {
		var alias;
		if ( alias = this.block.aliases[ keypath ] ) {
			return alias;
		}
		return keypath;
	}

	join ( keypath ) {
		return this.context.join( this.alias( keypath ) );
	}

	tryJoin ( keypath ) {
		return this.context.tryJoin( this.alias( keypath ) );
	}

	register ( dependant ) {
		return this.context.register( dependant );
	}

	unregister ( dependant ) {
		return this.context.unregister( dependant );
	}

	listRegister ( dependant ) {
		return this.context.listRegister( dependant );
	}

	listUnregister ( dependant ) {
		return this.context.listUnregister( dependant );
	}

	addWatcher ( key, resolve ) {
		return this.context.addWatcher( key, resolve );
	}
}


export default EachBlock;
