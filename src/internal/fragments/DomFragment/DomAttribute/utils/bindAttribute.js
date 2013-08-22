(function () {

	var getInterpolator,
		updateModel,
		getBinding,
		inheritProperties,
		arrayContentsMatch,
		MultipleSelectBinding,
		SelectBinding,
		RadioNameBinding,
		CheckboxNameBinding,
		CheckedBinding,
		FileListBinding,
		GenericBinding;

	bindAttribute = function () {
		var node = this.parentNode, interpolator, binding;

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

		//this.updateModel = getUpdater( this );
		binding = getBinding( this );

		if ( !binding ) {
			return false;
		}

		node._ractive.binding = binding;
		this.twoway = true;

		return true;
	};

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
			
		if ( item.type !== INTERPOLATOR ) {
			return null;
		}

		if ( !item.keypath && !item.ref ) {
			return null;
		}

		return item;
	};

	getBinding = function ( attribute ) {
		var node = attribute.parentNode;

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
			console.warn( 'This is... odd' );
		}

		if ( attribute.parentNode.type === 'file' ) {
			return new FileListBinding( attribute, node );
		}

		return new GenericBinding( attribute, node );
	};

	MultipleSelectBinding = function ( attribute, node ) {
		inheritProperties( this, attribute, node );
		node.addEventListener( 'change', updateModel, false );
	};

	MultipleSelectBinding.prototype = {
		update: function () {
			var attribute, value, selectedOptions, i, previousValue, changed, len;

			attribute = this.attr;
			previousValue = attribute.value || [];

			value = [];
			selectedOptions = this.node.querySelectorAll( 'option:checked' );
			len = selectedOptions.length;

			for ( i=0; i<len; i+=1 ) {
				value[ value.length ] = selectedOptions[i]._ractive.value;
			}

			// has the selection changed?
			changed = ( len !== previousValue.length );
			i = value.length;
			while ( i-- ) {
				if ( value[i] !== previousValue[i] ) {
					changed = true;
				}
			}

			if ( changed = true ) {
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
		inheritProperties( this, attribute, node );
		node.addEventListener( 'change', updateModel, false );
	};

	SelectBinding.prototype = {
		update: function () {
			var selectedOption, value;

			selectedOption = this.node.querySelector( 'option:checked' );

			if ( !selectedOption ) {
				return;
			}

			value = selectedOption._ractive.value;

			this.attr.receiving = true;
			this.attr.value = value;
			this.root.set( this.keypath, value );
			this.attr.receiving = false;
		},

		teardown: function () {
			this.node.removeEventListener( 'change', updateModel, false );
		}
	};

	RadioNameBinding = function ( attribute, node ) {
		inheritProperties( this, attribute, node );

		node.name = '{{' + attribute.keypath + '}}';

		node.addEventListener( 'change', updateModel, false );

		if ( node.attachEvent ) {
			node.addEventListener( 'click', updateModel, false );
		}
	};

	RadioNameBinding.prototype = {
		update: function () {
			var node = this.node;

			if ( node.checked ) {
				this.attr.receiving = true;
				this.root.set( this.keypath, node._ractive ? node._ractive.value : node.value );
				this.attr.receiving = false;
			}
		},

		teardown: function () {
			this.node.removeEventListener( 'change', updateModel, false );
			this.node.removeEventListener( 'click', updateModel, false );
		}
	};

	CheckboxNameBinding = function ( attribute, node ) {
		inheritProperties( this, attribute, node );

		node.name = '{{' + this.keypath + '}}';
		this.query = 'input[type="checkbox"][name="' + node.name + '"]';

		node.addEventListener( 'change', updateModel, false );

		if ( node.attachEvent ) {
			node.addEventListener( 'click', updateModel, false );
		}
	};

	CheckboxNameBinding.prototype = {
		update: function () {
			var previousValue, value, checkboxes, len, i, checkbox;

			previousValue = this.root.get( this.keypath );

			// TODO is this overkill?
			checkboxes = this.root.el.querySelectorAll( this.query );

			len = checkboxes.length;
			value = [];

			for ( i=0; i<len; i+=1 ) {
				checkbox = checkboxes[i];

				if ( checkbox.checked ) {
					value[ value.length ] = checkbox._ractive.value;
				}
			}

			if ( !arrayContentsMatch( previousValue, value ) ) {
				this.attr.receiving = true;
				this.root.set( this.keypath, value );
				this.attr.receiving = false;
			}
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
		update: function () {
			this.attr.receiving = true;
			this.root.set( this.keypath, this.node.checked );
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
		update: function () {
			this.attr.root.set( this.attr.keypath, this.attr.parentNode.files );
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
		update: function () {
			var attribute = this.attr, value = attribute.parentNode.value;

			// if the value is numeric, treat it as a number. otherwise don't
			if ( ( +value + '' === value ) && value.indexOf( 'e' ) === -1 ) {
				value = +value;
			}

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

	arrayContentsMatch = function ( a, b ) {
		var i;

		if ( !isArray( a ) || !isArray( b ) ) {
			return false;
		}

		if ( a.length !== b.length ) {
			return false;
		}

		i = a.length;
		while ( i-- ) {
			if ( a[i] !== b[i] ) {
				return false;
			}
		}

		return true;
	};

}());