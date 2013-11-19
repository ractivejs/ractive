define([
	'config/types',
	'utils/warn',
	'utils/arrayContentsMatch',
	'utils/isNumeric',
	'shared/getValueFromCheckboxes'
], function (
	types,
	warn,
	arrayContentsMatch,
	isNumeric,
	getValueFromCheckboxes
) {

	'use strict';

	var bindAttribute,

		getInterpolator,
		updateModel,
		getBinding,
		inheritProperties,
		MultipleSelectBinding,
		SelectBinding,
		RadioNameBinding,
		CheckboxNameBinding,
		CheckedBinding,
		FileListBinding,
		GenericBinding;

	bindAttribute = function () {
		var node = this.pNode, interpolator, binding, bindings;

		if ( !this.fragment ) {
			return false; // report failure
		}

		interpolator = getInterpolator( this );

		if ( !interpolator ) {
			return false; // report failure
		}

		this.interpolator = interpolator;

		// Hmmm. Not sure if this is the best way to handle this ambiguity...
		//
		// Let's say we were given `value="{{bar}}"`. If the context stack was
		// context stack was `["foo"]`, and `foo.bar` *wasn't* `undefined`, the
		// keypath would be `foo.bar`. Then, any user input would result in
		// `foo.bar` being updated.
		//
		// If, however, `foo.bar` *was* undefined, and so was `bar`, we would be
		// left with an unresolved partial keypath - so we are forced to make an
		// assumption. That assumption is that the input in question should
		// be forced to resolve to `bar`, and any user input would affect `bar`
		// and not `foo.bar`.
		//
		// Did that make any sense? No? Oh. Sorry. Well the moral of the story is
		// be explicit when using two-way data-binding about what keypath you're
		// updating. Using it in lists is probably a recipe for confusion...
		this.keypath = interpolator.keypath || interpolator.descriptor.r;

		binding = getBinding( this );

		if ( !binding ) {
			return false;
		}

		node._ractive.binding = binding;
		this.twoway = true;

		// register this with the root, so that we can force an update later
		bindings = this.root._twowayBindings[ this.keypath ] || ( this.root._twowayBindings[ this.keypath ] = [] );
		bindings[ bindings.length ] = binding;

		return true;
	};


	// This is the handler for DOM events that would lead to a change in the model
	// (i.e. change, sometimes, input, and occasionally click and keyup)
	updateModel = function () {
		this._ractive.binding.update();
	};

	getInterpolator = function ( attribute ) {
		var item;

		// TODO refactor this? Couldn't the interpolator have got a keypath via an expression?
		// Check this is a suitable candidate for two-way binding - i.e. it is
		// a single interpolator, which isn't an expression
		if ( attribute.fragment.items.length !== 1 ) {
			return null;
		}

		item = attribute.fragment.items[0];
			
		if ( item.type !== types.INTERPOLATOR ) {
			return null;
		}

		if ( !item.keypath && !item.ref ) {
			return null;
		}

		if ( item.descriptor.x ) {
			if ( attribute.root.debug ) {
				throw new Error( 'You cannot set up two-way binding against an expression' );
			}
			return null;
		}

		return item;
	};

	getBinding = function ( attribute ) {
		var node = attribute.pNode;

		if ( node.tagName === 'SELECT' ) {
			return ( node.multiple ? new MultipleSelectBinding( attribute, node ) : new SelectBinding( attribute, node ) );
		}

		if ( node.type === 'checkbox' || node.type === 'radio' ) {
			if ( attribute.propertyName === 'name' ) {
				if ( node.type === 'checkbox' ) {
					return new CheckboxNameBinding( attribute, node );
				}

				if ( node.type === 'radio' ) {
					return new RadioNameBinding( attribute, node );
				}
			}

			if ( attribute.propertyName === 'checked' ) {
				return new CheckedBinding( attribute, node );
			}

			return null;
		}

		if ( attribute.propertyName !== 'value' ) {
			warn( 'This is... odd' );
		}

		if ( attribute.pNode.type === 'file' ) {
			return new FileListBinding( attribute, node );
		}

		return new GenericBinding( attribute, node );
	};

	MultipleSelectBinding = function ( attribute, node ) {
		var valueFromModel;

		inheritProperties( this, attribute, node );
		node.addEventListener( 'change', updateModel, false );

		valueFromModel = this.root.get( this.keypath );

		if ( valueFromModel === undefined ) {
			// get value from DOM, if possible
			this.update();
		}
	};

	MultipleSelectBinding.prototype = {
		value: function () {
			var value, options, i, len;

			value = [];
			options = this.node.options;
			len = options.length;
			
			for ( i=0; i<len; i+=1 ) {
				if ( options[i].selected ) {
					value[ value.length ] = options[i]._ractive.value;
				}
			}

			return value;
		},

		update: function () {
			var attribute, previousValue, value;

			attribute = this.attr;
			previousValue = attribute.value;

			value = this.value();
			
			if ( previousValue === undefined || !arrayContentsMatch( value, previousValue ) ) {
				// either length or contents have changed, so we update the model
				attribute.receiving = true;
				attribute.value = value;
				this.root.set( this.keypath, value );
				attribute.receiving = false;
			}
		},

		teardown: function () {
			this.node.removeEventListener( 'change', updateModel, false );
		}
	};

	SelectBinding = function ( attribute, node ) {
		var valueFromModel;

		inheritProperties( this, attribute, node );
		node.addEventListener( 'change', updateModel, false );

		valueFromModel = this.root.get( this.keypath );

		if ( valueFromModel === undefined ) {
			// get value from DOM, if possible
			this.update();
		}
	};

	SelectBinding.prototype = {
		value: function () {
			var options, i, len;

			options = this.node.options;
			len = options.length;

			for ( i=0; i<len; i+=1 ) {
				if ( options[i].selected ) {
					return options[i]._ractive.value;
				}
			}
		},

		update: function () {
			var value = this.value();

			if ( isNumeric( value ) ) {
				value = +value;
			}

			this.attr.receiving = true;
			this.attr.value = value;
			this.root.set( this.keypath, value );
			this.attr.receiving = false;

			return this;
		},

		deferUpdate: function () {
			if ( this.deferred === true ) {
				return;
			}

			// TODO we're hijacking an existing bit of functionality here...
			// the whole deferred updates thing could use a spring clean
			this.root._defAttrs.push( this );
			this.deferred = true;
		},

		teardown: function () {
			this.node.removeEventListener( 'change', updateModel, false );
		}
	};

	RadioNameBinding = function ( attribute, node ) {
		var valueFromModel;

		this.radioName = true; // so that updateModel knows what to do with this

		inheritProperties( this, attribute, node );

		node.name = '{{' + attribute.keypath + '}}';

		node.addEventListener( 'change', updateModel, false );

		if ( node.attachEvent ) {
			node.addEventListener( 'click', updateModel, false );
		}

		valueFromModel = this.root.get( this.keypath );
		if ( valueFromModel !== undefined ) {
			node.checked = ( valueFromModel === node._ractive.value );
		} else {
			this.root._defRadios[ this.root._defRadios.length ] = this;
		}
	};

	RadioNameBinding.prototype = {
		value: function () {
			return this.node._ractive ? this.node._ractive.value : this.node.value;
		},

		update: function () {
			var node = this.node;

			if ( node.checked ) {
				this.attr.receiving = true;
				this.root.set( this.keypath, this.value() );
				this.attr.receiving = false;
			}
		},

		teardown: function () {
			this.node.removeEventListener( 'change', updateModel, false );
			this.node.removeEventListener( 'click', updateModel, false );
		}
	};

	CheckboxNameBinding = function ( attribute, node ) {
		var valueFromModel, checked;

		this.checkboxName = true; // so that updateModel knows what to do with this

		inheritProperties( this, attribute, node );

		node.name = '{{' + this.keypath + '}}';

		node.addEventListener( 'change', updateModel, false );

		// in case of IE emergency, bind to click event as well
		if ( node.attachEvent ) {
			node.addEventListener( 'click', updateModel, false );
		}

		valueFromModel = this.root.get( this.keypath );

		// if the model already specifies this value, check/uncheck accordingly
		if ( valueFromModel !== undefined ) {
			checked = valueFromModel.indexOf( node._ractive.value ) !== -1;
			node.checked = checked;
		}

		// otherwise make a note that we will need to update the model later
		else {
			if ( this.root._defCheckboxes.indexOf( this.keypath ) === -1 ) {
				this.root._defCheckboxes[ this.root._defCheckboxes.length ] = this.keypath;
			}
		}
	};

	CheckboxNameBinding.prototype = {
		changed: function () {
			return this.node.checked !== !!this.checked;
		},

		update: function () {
			this.checked = this.node.checked;

			this.attr.receiving = true;
			this.root.set( this.keypath, getValueFromCheckboxes( this.root, this.keypath ) );
			this.attr.receiving = false;
		},

		teardown: function () {
			this.node.removeEventListener( 'change', updateModel, false );
			this.node.removeEventListener( 'click', updateModel, false );
		}
	};

	CheckedBinding = function ( attribute, node ) {
		inheritProperties( this, attribute, node );

		node.addEventListener( 'change', updateModel, false );

		if ( node.attachEvent ) {
			node.addEventListener( 'click', updateModel, false );
		}
	};

	CheckedBinding.prototype = {
		value: function () {
			return this.node.checked;
		},

		update: function () {
			this.attr.receiving = true;
			this.root.set( this.keypath, this.value() );
			this.attr.receiving = false;
		},

		teardown: function () {
			this.node.removeEventListener( 'change', updateModel, false );
			this.node.removeEventListener( 'click', updateModel, false );
		}
	};

	FileListBinding = function ( attribute, node ) {
		inheritProperties( this, attribute, node );

		node.addEventListener( 'change', updateModel, false );
	};

	FileListBinding.prototype = {
		value: function () {
			return this.attr.pNode.files;
		},

		update: function () {
			this.attr.root.set( this.attr.keypath, this.value() );
		},

		teardown: function () {
			this.node.removeEventListener( 'change', updateModel, false );
		}
	};

	GenericBinding = function ( attribute, node ) {
		inheritProperties( this, attribute, node );

		node.addEventListener( 'change', updateModel, false );

		if ( !this.root.lazy ) {
			node.addEventListener( 'input', updateModel, false );

			if ( node.attachEvent ) {
				node.addEventListener( 'keyup', updateModel, false );
			}
		}
	};

	GenericBinding.prototype = {
		value: function () {
			var value = this.attr.pNode.value;

			// if the value is numeric, treat it as a number. otherwise don't
			if ( ( +value + '' === value ) && value.indexOf( 'e' ) === -1 ) {
				value = +value;
			}

			return value;
		},

		update: function () {
			var attribute = this.attr, value = this.value();

			attribute.receiving = true;
			attribute.root.set( attribute.keypath, value );
			attribute.receiving = false;
		},

		teardown: function () {
			this.node.removeEventListener( 'change', updateModel, false );
			this.node.removeEventListener( 'input', updateModel, false );
			this.node.removeEventListener( 'keyup', updateModel, false );
		}
	};

	inheritProperties = function ( binding, attribute, node ) {
		binding.attr = attribute;
		binding.node = node;
		binding.root = attribute.root;
		binding.keypath = attribute.keypath;
	};

	return bindAttribute;

});