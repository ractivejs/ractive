define(['utils/isArray','utils/removeFromArray','virtualdom/items/Element/Binding/Binding','virtualdom/items/Element/Binding/shared/getSiblings','virtualdom/items/Element/Binding/shared/handleDomEvent'],function (isArray, removeFromArray, Binding, getSiblings, handleDomEvent) {

	'use strict';
	
	var CheckboxNameBinding = Binding.extend({
		name: 'name',
	
		getInitialValue: function () {
			// This only gets called once per group (of inputs that
			// share a name), because it only gets called if there
			// isn't an initial value. By the same token, we can make
			// a note of that fact that there was no initial value,
			// and populate it using any `checked` attributes that
			// exist (which users should avoid, but which we should
			// support anyway to avoid breaking expectations)
			this.noInitialValue = true;
			return [];
		},
	
		init: function () {
			var existingValue, bindingValue, noInitialValue;
	
			this.checkboxName = true; // so that ractive.updateModel() knows what to do with this
	
			// Each input has a reference to an array containing it and its
			// siblings, as two-way binding depends on being able to ascertain
			// the status of all inputs within the group
			this.siblings = getSiblings( this.root._guid, 'checkboxes', this.keypath );
			this.siblings.push( this );
	
			if ( this.noInitialValue ) {
				this.siblings.noInitialValue = true;
			}
	
			noInitialValue = this.siblings.noInitialValue;
	
			existingValue = this.root.viewmodel.get( this.keypath );
			bindingValue = this.element.getAttribute( 'value' );
	
			if ( noInitialValue ) {
				this.isChecked = this.element.getAttribute( 'checked' );
	
				if ( this.isChecked ) {
					existingValue.push( bindingValue );
				}
			} else {
				this.isChecked = ( isArray( existingValue ) ? existingValue.indexOf( bindingValue ) !== -1 : existingValue === bindingValue );
			}
		},
	
		unbind: function () {
			removeFromArray( this.siblings, this );
		},
	
		render: function () {
			var node = this.element.node;
	
			node.name = '{{' + this.keypath + '}}';
			node.checked = this.isChecked;
	
			node.addEventListener( 'change', handleDomEvent, false );
	
			// in case of IE emergency, bind to click event as well
			if ( node.attachEvent ) {
				node.addEventListener( 'click', handleDomEvent, false );
			}
		},
	
		unrender: function () {
			var node = this.element.node;
	
			node.removeEventListener( 'change', handleDomEvent, false );
			node.removeEventListener( 'click', handleDomEvent, false );
		},
	
		changed: function () {
			var wasChecked = !!this.isChecked;
			this.isChecked = this.element.node.checked;
			return this.isChecked === wasChecked;
		},
	
		handleChange: function () {
			this.isChecked = this.element.node.checked;
			Binding.prototype.handleChange.call( this );
		},
	
		getValue: function () {
			return this.siblings.filter( isChecked ).map( getValue );
		}
	});
	
	function isChecked ( binding ) {
		return binding.isChecked;
	}
	
	function getValue ( binding ) {
		return binding.element.getAttribute( 'value' );
	}
	
	return CheckboxNameBinding;

});