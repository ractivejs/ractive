define([
	'global/runloop',
	'config/types',
	'render/DomFragment/Attribute/helpers/determineNameAndNamespace',
	'render/DomFragment/Attribute/helpers/setStaticAttribute',
	'render/DomFragment/Attribute/helpers/determinePropertyName',
	'render/DomFragment/Attribute/helpers/getInterpolator',
	'render/DomFragment/Attribute/prototype/bind',
	'render/DomFragment/Attribute/prototype/update',
	'render/StringFragment/_StringFragment'
], function (
	runloop,
	types,
	determineNameAndNamespace,
	setStaticAttribute,
	determinePropertyName,
	getInterpolator,
	bind,
	update,
	StringFragment
) {

	'use strict';

	var DomAttribute = function ( options ) {

		this.type = types.ATTRIBUTE;
		this.element = options.element;
		determineNameAndNamespace( this, options.name );

		// if it's an empty attribute, or just a straight key-value pair, with no
		// mustache shenanigans, set the attribute accordingly and go home
		if ( options.value === null || typeof options.value === 'string' ) {
			setStaticAttribute( this, options );
			return;
		}

		// otherwise we need to do some work
		this.root = options.root;
		this.pNode = options.pNode;

		// share parentFragment with parent element
		this.parentFragment = this.element.parentFragment;

		this.fragment = new StringFragment({
			descriptor:   options.value,
			root:         this.root,
			owner:        this
		});


		// Store a reference to this attribute's interpolator, if its fragment
		// takes the form `{{foo}}`. This is necessary for two-way binding and
		// for correctly rendering HTML later
		this.interpolator = getInterpolator( this );

		// if we're not rendering (i.e. we're just stringifying), we can stop here
		if ( !this.pNode ) {
			return;
		}

		// special cases
		if ( this.name === 'value' ) {
			this.isValueAttribute = true;

			// TODO need to wait until afterwards to determine type, in case we
			// haven't initialised that attribute yet
			// <input type='file' value='{{value}}'>
			if ( this.pNode.tagName === 'INPUT' && this.pNode.type === 'file' ) {
				this.isFileInputValue = true;
			}
		}

		// can we establish this attribute's property name equivalent?
		determinePropertyName( this, options );

		// determine whether this attribute can be marked as self-updating
		this.selfUpdating = this.fragment.isSimple();

		// mark as ready
		this.ready = true;
	};

	DomAttribute.prototype = {
		bind: bind,
		update: update,

		updateBindings: function () {
			// if the fragment this attribute belongs to gets reassigned (as a result of
			// as section being updated via an array shift, unshift or splice), this
			// attribute needs to recognise that its keypath has changed
			this.keypath = this.interpolator.keypath || this.interpolator.ref;

			// if we encounter the special case described above, update the name attribute
			if ( this.propertyName === 'name' ) {
				// replace actual name attribute
				this.pNode.name = '{{' + this.keypath + '}}';
			}
		},

		reassign: function ( indexRef, newIndex, oldKeypath, newKeypath ) {
			if ( this.fragment ) {
				this.fragment.reassign( indexRef, newIndex, oldKeypath, newKeypath );

				if ( this.twoway ) {
					this.updateBindings();
				}
			}
		},

		teardown: function () {
			var i;

			if ( this.boundEvents ) {
				i = this.boundEvents.length;

				while ( i-- ) {
					this.pNode.removeEventListener( this.boundEvents[i], this.updateModel, false );
				}
			}

			// ignore non-dynamic attributes
			if ( this.fragment ) {
				this.fragment.teardown();
			}
		},

		bubble: function () {
			// If an attribute's text fragment contains a single item, we can
			// update the DOM immediately...
			if ( this.selfUpdating ) {
				this.update();
			}

			// otherwise we want to register it as a deferred attribute, to be
			// updated once all the information is in, to prevent unnecessary
			// DOM manipulation
			else if ( !this.deferred && this.ready ) {
				runloop.addAttribute( this );
				this.deferred = true;
			}
		},

		toString: function () {
			var str, interpolator;

			if ( this.value === null ) {
				return this.name;
			}

			// Special case - select values (should not be stringified)
			if ( this.name === 'value' && this.element.lcName === 'select' ) {
				return;
			}

			// Special case - radio names
			if ( this.name === 'name' && this.element.lcName === 'input' && ( interpolator = this.interpolator ) ) {
				return 'name={{' + ( interpolator.keypath || interpolator.ref ) + '}}';
			}

			// TODO don't use JSON.stringify?

			if ( !this.fragment ) {
				return this.name + '=' + JSON.stringify( this.value );
			}

			// TODO deal with boolean attributes correctly
			str = this.fragment.toString();

			return this.name + '=' + JSON.stringify( str );
		}
	};

	return DomAttribute;

});
