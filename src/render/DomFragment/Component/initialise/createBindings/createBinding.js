define([
	'utils/isArray',
	'utils/isEqual',
	'shared/registerDependant',
	'shared/unregisterDependant'
], function (
	isArray,
	isEqual,
	registerDependant,
	unregisterDependant
) {

	'use strict';

	var Binding = function ( ractive, keypath, otherInstance, otherKeypath, priority ) {
		this.root = ractive;
		this.keypath = keypath;
		this.priority = priority;

		this.otherInstance = otherInstance;
		this.otherKeypath = otherKeypath;

		registerDependant( this );
	};

	Binding.prototype = {
		init: function ( propagate ) {
			var value = this.root.get( this.keypath );

			// Data should propagate from child to parent
			if ( propagate && value !== undefined ) {
				this.update();
			} else {
				this.value = value;
			}
		},

		update: function () {
			var value;

			// Only *you* can prevent infinite loops
			if ( this.counterpart && this.counterpart.setting ) {
				return;
			}

			value = this.root.get( this.keypath );

			// Is this a smart array update? If so, it'll update on its
			// own, we shouldn't do anything
			if ( isArray( value ) && value._ractive && value._ractive.setting ) {
				return;
			}

			if ( !isEqual( value, this.value ) ) {
				this.setting = true;
				this.otherInstance.set( this.otherKeypath, value );
				this.value = value;
				this.setting = false;
			}
		},

		teardown: function () {
			unregisterDependant( this );
		}
	};


	return function ( component, parentInstance, parentKeypath, childKeypath, options ) {
		var hash, childInstance, bindings, priority, parentToChildBinding, childToParentBinding;

		hash = parentKeypath + '=' + childKeypath;
		bindings = component.bindings;

		if ( bindings[ hash ] ) {
			// TODO does this ever happen?
			return;
		}

		bindings[ hash ] = true;

		childInstance = component.instance;
		priority = component.parentFragment.priority;

		parentToChildBinding = new Binding( parentInstance, parentKeypath, childInstance, childKeypath, priority );
		parentToChildBinding.init( options && options.propagateDown );
		bindings.push( parentToChildBinding );

		if ( childInstance.twoway ) {
			childToParentBinding = new Binding( childInstance, childKeypath, parentInstance, parentKeypath, 1 );
			bindings.push( childToParentBinding );

			parentToChildBinding.counterpart = childToParentBinding;
			childToParentBinding.counterpart = parentToChildBinding;

			// propagate child data upwards, if it exists already
			childToParentBinding.init( true );
		}
	};

});
