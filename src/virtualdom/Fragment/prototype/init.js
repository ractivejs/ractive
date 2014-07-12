import types from 'config/types';
import create from 'utils/create';
import createItem from 'virtualdom/Fragment/prototype/init/createItem';

export default function Fragment$init ( options ) {

	var parentFragment, parentRefs, ref;

	// The item that owns this fragment - an element, section, partial, or attribute
	this.owner = options.owner;
	parentFragment = this.parent = this.owner.parentFragment;

	// inherited properties
	this.root = options.root;
	this.pElement = options.pElement;
	this.context = options.context;

	// If parent item is a section, this may not be the only fragment
	// that belongs to it - we need to make a note of the index
	if ( this.owner.type === types.SECTION ) {
		this.index = options.index;
	}

	// index references (the 'i' in {{#section:i}}...{{/section}}) need to cascade
	// down the tree
	if ( parentFragment ) {
		parentRefs = parentFragment.indexRefs;

		if ( parentRefs ) {
			this.indexRefs = create( null ); // avoids need for hasOwnProperty

			for ( ref in parentRefs ) {
				this.indexRefs[ ref ] = parentRefs[ ref ];
			}
		}
	}

	// inherit priority
	this.priority = ( parentFragment ? parentFragment.priority + 1 : 1 );

	if ( options.indexRef ) {
		if ( !this.indexRefs ) {
			this.indexRefs = {};
		}

		this.indexRefs[ options.indexRef ] = options.index;
	}

	// Time to create this fragment's child items

	// TEMP should this be happening?
	if ( typeof options.template === 'string' ) {
		options.template = [ options.template ];
	} else if ( !options.template ) {
		options.template = [];
	}

	this.items = options.template.map( ( template, i ) => createItem({
		parentFragment: this,
		pElement: options.pElement,
		template: template,
		index: i
	}) );

	this.value = this.argsList = null;
	this.dirtyArgs = this.dirtyValue = true;

	this.inited = true;
}
