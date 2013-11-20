define([
	'config/namespaces',
	'render/DomFragment/shared/enforceCase',
	'render/DomFragment/Attribute/bindAttribute',
	'render/DomFragment/Attribute/updateAttribute',
	'render/StringFragment/_StringFragment'
], function (
	namespaces,
	enforceCase,
	bindAttribute,
	updateAttribute,
	StringFragment
) {

	'use strict';

	var DomAttribute,

		// helpers
		propertyNames,
		determineNameAndNamespace,
		setStaticAttribute,
		determinePropertyName;

	// the property name equivalents for element attributes, where they differ
	// from the lowercased attribute name
	propertyNames = {
		'accept-charset': 'acceptCharset',
		accesskey: 'accessKey',
		bgcolor: 'bgColor',
		'class': 'className',
		codebase: 'codeBase',
		colspan: 'colSpan',
		contenteditable: 'contentEditable',
		datetime: 'dateTime',
		dirname: 'dirName',
		'for': 'htmlFor',
		'http-equiv': 'httpEquiv',
		ismap: 'isMap',
		maxlength: 'maxLength',
		novalidate: 'noValidate',
		pubdate: 'pubDate',
		readonly: 'readOnly',
		rowspan: 'rowSpan',
		tabindex: 'tabIndex',
		usemap: 'useMap'
	};

	// Attribute
	DomAttribute = function ( options ) {

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
			owner:        this,
			contextStack: options.contextStack
		});


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
		bind: bindAttribute,
		update: updateAttribute,

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
				this.root._defAttrs[ this.root._defAttrs.length ] = this;
				this.deferred = true;
			}
		},

		toString: function () {
			var str;

			if ( this.value === null ) {
				return this.name;
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


	// Helper functions
	determineNameAndNamespace = function ( attribute, name ) {
		var colonIndex, namespacePrefix;

		// are we dealing with a namespaced attribute, e.g. xlink:href?
		colonIndex = name.indexOf( ':' );
		if ( colonIndex !== -1 ) {

			// looks like we are, yes...
			namespacePrefix = name.substr( 0, colonIndex );

			// ...unless it's a namespace *declaration*, which we ignore (on the assumption
			// that only valid namespaces will be used)
			if ( namespacePrefix !== 'xmlns' ) {
				name = name.substring( colonIndex + 1 );

				attribute.name = enforceCase( name );
				attribute.lcName = attribute.name.toLowerCase();
				attribute.namespace = namespaces[ namespacePrefix.toLowerCase() ];

				if ( !attribute.namespace ) {
					throw 'Unknown namespace ("' + namespacePrefix + '")';
				}

				return;
			}
		}

		// SVG attribute names are case sensitive
		attribute.name = ( attribute.element.namespace !== namespaces.html ? enforceCase( name ) : name );
		attribute.lcName = attribute.name.toLowerCase();
	};

	setStaticAttribute = function ( attribute, options ) {
		var node, value = ( options.value === null ? '' : options.value );

		if ( node = options.pNode ) {
			if ( attribute.namespace ) {
				node.setAttributeNS( attribute.namespace, options.name, value );
			} else {

				// is it a style attribute? and are we in a broken POS browser?
				if ( options.name === 'style' && node.style.setAttribute ) {
					node.style.setAttribute( 'cssText', value );
				}

				// some browsers prefer className to class...
				else if ( options.name === 'class' && ( !node.namespaceURI || node.namespaceURI === namespaces.html ) ) {
					node.className = value;
				}

				else {
					node.setAttribute( options.name, value );
				}
			}

			if ( attribute.name === 'id' ) {
				options.root.nodes[ options.value ] = node;
			}

			if ( attribute.name === 'value' ) {
				node._ractive.value = options.value;
			}
		}

		attribute.value = options.value;
	};

	determinePropertyName = function ( attribute, options ) {
		var propertyName;

		if ( attribute.pNode && !attribute.namespace && ( !options.pNode.namespaceURI || options.pNode.namespaceURI === namespaces.html ) ) {
			propertyName = propertyNames[ attribute.name ] || attribute.name;

			if ( options.pNode[ propertyName ] !== undefined ) {
				attribute.propertyName = propertyName;
			}

			// is attribute a boolean attribute or 'value'? If so we're better off doing e.g.
			// node.selected = true rather than node.setAttribute( 'selected', '' )
			if ( typeof options.pNode[ propertyName ] === 'boolean' || propertyName === 'value' ) {
				attribute.useProperty = true;
			}
		}
	};

	return DomAttribute;

});