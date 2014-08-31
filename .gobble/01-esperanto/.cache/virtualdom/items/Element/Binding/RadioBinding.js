define(['global/runloop','utils/removeFromArray','virtualdom/items/Element/Binding/Binding','virtualdom/items/Element/Binding/shared/getSiblings','virtualdom/items/Element/Binding/shared/handleDomEvent'],function (runloop, removeFromArray, Binding, getSiblings, handleDomEvent) {

	'use strict';
	
	var RadioBinding = Binding.extend({
		name: 'checked',
	
		init: function () {
			this.siblings = getSiblings( this.root._guid, 'radio', this.element.getAttribute( 'name' ) );
			this.siblings.push( this );
		},
	
		render: function () {
			var node = this.element.node;
	
			node.addEventListener( 'change', handleDomEvent, false );
	
			if ( node.attachEvent ) {
				node.addEventListener( 'click', handleDomEvent, false );
			}
		},
	
		unrender: function () {
			var node = this.element.node;
	
			node.removeEventListener( 'change', handleDomEvent, false );
			node.removeEventListener( 'click', handleDomEvent, false );
		},
	
		handleChange: function () {
			runloop.start( this.root );
	
			this.siblings.forEach( binding => {
				binding.root.viewmodel.set( binding.keypath, binding.getValue() );
			});
	
			runloop.end();
		},
	
		getValue: function () {
			return this.element.node.checked;
		},
	
		unbind: function () {
			removeFromArray( this.siblings, this );
		}
	});
	
	return RadioBinding;

});