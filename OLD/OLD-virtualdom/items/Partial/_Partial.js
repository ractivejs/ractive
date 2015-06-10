import { warnOnceIfDebug } from 'utils/log';
import { PARTIAL, TEXT } from 'config/types';
import runloop from 'global/runloop';
import Fragment from 'virtualdom/Fragment';
import Mustache from '../shared/Mustache/_Mustache';
import unbind from '../shared/unbind';
import getPartialTemplate from './getPartialTemplate';
import applyIndent from './applyIndent';

let missingPartialMessage = 'Could not find template for partial "%s"';

let Partial = function ( options ) {
	var parentFragment, template;

	parentFragment = this.parentFragment = options.parentFragment;

	this.root = parentFragment.root;
	this.type = PARTIAL;
	this.index = options.index;
	this.name = options.template.r;
	this.rendered = false;

	this.fragment = this.fragmentToRender = this.fragmentToUnrender = null;

	Mustache.init( this, options );

	if ( !this.fragment ) {
		if ( template = getPartialTemplate( this.root, this.name, parentFragment ) ) {
			unbind.call( this ); // prevent any further changes
			this.isNamed = true;
			this.setTemplate( template );
		} else {
			warnOnceIfDebug( missingPartialMessage, this.name );
		}
	}

};

Partial.prototype = {
	bubble () {
		this.parentFragment.bubble();
	},

	detach () {
		return this.fragment.detach();
	},

	find ( selector ) {
		return this.fragment.find( selector );
	},

	findAll ( selector, query ) {
		return this.fragment.findAll( selector, query );
	},

	findComponent ( selector ) {
		return this.fragment.findComponent( selector );
	},

	findAllComponents ( selector, query ) {
		return this.fragment.findAllComponents( selector, query );
	},

	firstNode () {
		return this.fragment.firstNode();
	},

	findNextNode () {
		return this.parentFragment.findNextNode( this );
	},

	getPartialName () {
		if ( this.isNamed && this.name ) return this.name;
		else if ( this.value === undefined ) return this.name;
		else return this.value;
	},

	getValue () {
		return this.fragment.getValue();
	},

	rebind ( oldKeypath, newKeypath ) {
		// TODO delete this
	},

	render () {
		this.docFrag = document.createDocumentFragment();
		this.update();

		this.rendered = true;
		return this.docFrag;
	},

	resolve: Mustache.resolve,

	setValue ( value ) {
		var template;

		if ( value != null && value === this.value ) {
			// nothing has changed, so no work to be done
			return;
		}

		if ( value != null ) {
			template = getPartialTemplate( this.root, '' + value, this.parentFragment );
		}

		// we may be here if we have a partial like `{{>foo}}` and `foo` is the
		// name of both a data property (whose value ISN'T the name of a partial)
		// and a partial. In those cases, this becomes a named partial
		if ( !template && this.name && ( template = getPartialTemplate( this.root, this.name, this.parentFragment ) ) ) {
			unbind.call( this );
			this.isNamed = true;
		}

		if ( !template ) {
			warnOnceIfDebug( missingPartialMessage, this.name, { ractive: this.root });
		}

		this.value = value;

		this.setTemplate( template || [] );

		this.bubble();

		if ( this.rendered ) {
			runloop.addView( this );
		}
	},

	setTemplate ( template ) {
		if ( this.fragment ) {
			this.fragment.unbind();
			if ( this.rendered ) {
				this.fragmentToUnrender = this.fragment;
			}
		}

		this.fragment = new Fragment({
			template,
			root: this.root,
			owner: this,
			pElement: this.parentFragment.pElement
		});

		this.fragmentToRender = this.fragment;
	},

	toString ( toString ) {
		var string, previousItem, lastLine, match;

		string = this.fragment.toString( toString );

		previousItem = this.parentFragment.items[ this.index - 1 ];

		if ( !previousItem || ( previousItem.type !== TEXT ) ) {
			return string;
		}

		lastLine = previousItem.text.split( '\n' ).pop();

		if ( match = /^\s+$/.exec( lastLine ) ) {
			return applyIndent( string, match[0] );
		}

		return string;
	},

	unbind () {
		if ( !this.isNamed ) { // dynamic partial - need to unbind self
			unbind.call( this );
		}

		if ( this.fragment ) {
			this.fragment.unbind();
		}
	},

	unrender ( shouldDestroy ) {
		if ( this.rendered ) {
			if ( this.fragment ) {
				this.fragment.unrender( shouldDestroy );
			}
			this.rendered = false;
		}
	},

	update() {
		var target, anchor;

		if ( this.fragmentToUnrender ) {
			this.fragmentToUnrender.unrender( true );
			this.fragmentToUnrender = null;
		}

		if ( this.fragmentToRender ) {
			this.docFrag.appendChild( this.fragmentToRender.render() );
			this.fragmentToRender = null;
		}

		if ( this.rendered ) {
			target = this.parentFragment.getNode();
			anchor = this.parentFragment.findNextNode( this );
			target.insertBefore( this.docFrag, anchor );
		}
	}
};

export default Partial;
