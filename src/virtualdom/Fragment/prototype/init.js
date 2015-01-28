import { INTERPOLATOR, SECTION, TRIPLE, ELEMENT, PARTIAL, COMMENT, DOCTYPE } from 'config/types';
import Text from 'virtualdom/items/Text';
import Interpolator from 'virtualdom/items/Interpolator';
import Section from 'virtualdom/items/Section/_Section';
import Triple from 'virtualdom/items/Triple/_Triple';
import Element from 'virtualdom/items/Element/_Element';
import Partial from 'virtualdom/items/Partial/_Partial';
import getComponent from 'virtualdom/items/Component/getComponent';
import Component from 'virtualdom/items/Component/_Component';
import Comment from 'virtualdom/items/Comment';
import Yielder from 'virtualdom/items/Yielder';
import Doctype from 'virtualdom/items/Doctype';
import { scheduleSiblingHandler } from '../../items/Section/prototype/setValue';

export default function Fragment$init ( options ) {
	var left = 0;
	this.owner = options.owner; // The item that owns this fragment - an element, section, partial, or attribute
	this.parent = this.owner.parentFragment;

	// inherited properties
	this.root = options.root;
	this.pElement = options.pElement;
	this.context = options.context;
	this.index = options.index;
	this.key = options.key;
	this.registeredIndexRefs = [];

	this.items = options.template.map( ( template, i ) => {
		var opts = {
			parentFragment: this,
			pElement: options.pElement,
			template,
			index: i
		};

		// keep track of sibling sections
		if ( left-- > 0 ) {
			opts.siblings = true;
		} else if ( template.b ) {
			opts.siblings = true;
			left = template.b;
		}

		return createItem(opts);
	});

	// link up sections with siblings
	this.items.forEach( ( fragment, i ) => {
		if ( fragment.template && fragment.template.b ) {
			let siblings = this.items.slice( i, i + fragment.template.b + 1 );
			siblings.unlocked = true;
			siblings.forEach( s => s.siblings = siblings );
			scheduleSiblingHandler( fragment );
		}
	});

	this.value = this.argsList = null;
	this.dirtyArgs = this.dirtyValue = true;

	this.bound = true;
}

function createItem ( options ) {
	if ( typeof options.template === 'string' ) {
		return new Text( options );
	}

	switch ( options.template.t ) {
		case INTERPOLATOR:
			if ( options.template.r === 'yield' ) {
				return new Yielder( options );
			}
			return new Interpolator( options );
		case SECTION:      return new Section( options );
		case TRIPLE:       return new Triple( options );
		case ELEMENT:
			let constructor;
			if ( constructor = getComponent( options.parentFragment.root, options.template.e ) ) {
				return new Component( options, constructor );
			}
			return new Element( options );
		case PARTIAL:      return new Partial( options );
		case COMMENT:      return new Comment( options );
		case DOCTYPE:      return new Doctype( options );

		default: throw new Error( 'Something very strange happened. Please file an issue at https://github.com/ractivejs/ractive/issues. Thanks!' );
	}
}
