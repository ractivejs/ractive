import { fatal, warnOnce } from 'utils/log';
import { PARTIAL, TEXT } from 'config/types';
import runloop from 'global/runloop';
import Fragment from 'virtualdom/Fragment';
import Mustache from '../shared/Mustache/_Mustache';
import rebind from '../shared/Mustache/rebind';
import unbind from '../shared/unbind';
import getPartialTemplate from './getPartialTemplate';
import applyIndent from './applyIndent';

var Partial = function ( options ) {
	var parentFragment, template;

	parentFragment = this.parentFragment = options.parentFragment;

	this.root = parentFragment.root;
	this.type = PARTIAL;
	this.index = options.index;
	this.name = options.template.r;

	this.fragment = this.fragmentToRender = this.fragmentToUnrender = null;

	Mustache.init( this, options );

	// If this didn't resolve, it most likely means we have a named partial
	// (i.e. `{{>foo}}` means 'use the foo partial', not 'use the partial
	// whose name is the value of `foo`')
	if ( !this.keypath && ( template = getPartialTemplate( this.root, this.name ) ) ) {
		unbind.call( this ); // prevent any further changes
		this.isNamed = true;

		this.setTemplate( template );
	}
};

Partial.prototype = {
	bubble: function () {
		this.parentFragment.bubble();
	},

	detach: function () {
		return this.fragment.detach();
	},

	find: function ( selector ) {
		return this.fragment.find( selector );
	},

	findAll: function ( selector, query ) {
		return this.fragment.findAll( selector, query );
	},

	findComponent: function ( selector ) {
		return this.fragment.findComponent( selector );
	},

	findAllComponents: function ( selector, query ) {
		return this.fragment.findAllComponents( selector, query );
	},

	firstNode: function () {
		return this.fragment.firstNode();
	},

	findNextNode: function () {
		return this.parentFragment.findNextNode( this );
	},

	getPartialName: function () {
		if ( this.isNamed && this.name ) return this.name;
		else if ( this.value === undefined ) return this.name;
		else return this.value;
	},

	getValue: function () {
		return this.fragment.getValue();
	},

	rebind: function ( oldKeypath, newKeypath ) {
		// named partials aren't bound, so don't rebind
		if ( !this.isNamed ) {
			rebind.call( this, oldKeypath, newKeypath );
		}

		this.fragment.rebind( oldKeypath, newKeypath );
	},

	render: function () {
		this.docFrag = document.createDocumentFragment();
		this.update();

		this.rendered = true;
		return this.docFrag;
	},

	resolve: Mustache.resolve,

	setValue: function ( value ) {
		var template;

		if ( value !== undefined && value === this.value ) {
			// nothing has changed, so no work to be done
			return;
		}

		if ( value !== undefined ) {
			template = getPartialTemplate( this.root, '' + value );
		}

		// we may be here if we have a partial like `{{>foo}}` and `foo` is the
		// name of both a data property (whose value ISN'T the name of a partial)
		// and a partial. In those cases, this becomes a named partial
		if ( !template && this.name && ( template = getPartialTemplate( this.root, this.name ) ) ) {
			unbind.call( this );
			this.isNamed = true;
		}

		if ( !template ) {
			( this.root.debug ? fatal : warnOnce )( 'Could not find template for partial "%s"', this.name );
		}

		this.value = value;

		this.setTemplate( template || [] );

		this.bubble();

		if ( this.rendered ) {
			runloop.addView( this );
		}
	},

	setTemplate: function ( template ) {
		if ( this.fragment ) {
			this.fragment.unbind();
			this.fragmentToUnrender = this.fragment;
		}

		this.fragment = new Fragment({
			template: template,
			root: this.root,
			owner: this,
			pElement: this.parentFragment.pElement
		});

		this.fragmentToRender = this.fragment;
	},

	toString: function ( toString ) {
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

	unbind: function () {
		if ( !this.isNamed ) { // dynamic partial - need to unbind self
			unbind.call( this );
		}

		if ( this.fragment ) {
			this.fragment.unbind();
		}
	},

	unrender: function ( shouldDestroy ) {
		if ( this.rendered ) {
			if( this.fragment ) {
				this.fragment.unrender( shouldDestroy );
			}
			this.rendered = false;
		}
	},

	update: function() {
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
