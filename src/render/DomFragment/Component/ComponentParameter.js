define([
	'render/StringFragment/_StringFragment'
], function (
	StringFragment
) {

	'use strict';

	var ComponentParameter = function ( root, component, key, value, contextStack ) {

		this.parentFragment = component.parentFragment;
		this.component = component;
		this.key = key;

		this.fragment = new StringFragment({
			descriptor:   value,
			root:         root,
			owner:        this,
			contextStack: contextStack
		});

		this.selfUpdating = this.fragment.isSimple();
		this.value = this.fragment.getValue();
	};

	ComponentParameter.prototype = {
		bubble: function () {
			// If there's a single item, we can update the component immediately...
			if ( this.selfUpdating ) {
				this.update();
			}

			// otherwise we want to register it as a deferred parameter, to be
			// updated once all the information is in, to prevent unnecessary
			// DOM manipulation
			else if ( !this.deferred && this.ready ) {
				this.root._deferred.attrs.push( this );
				this.deferred = true;
			}
		},

		update: function () {
			var value = this.fragment.getValue();

			this.component.instance.set( this.key, value );
			this.value = value;
		},

		teardown: function () {
			this.fragment.teardown();
		}
	};

	return ComponentParameter;

});
