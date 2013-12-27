define([

], function (

) {

	'use strict';

	return function ( component, Component, data, docFrag, contentDescriptor ) {
		var instance, parentFragment, partials, root;

		parentFragment = component.parentFragment;
		root = component.root;

		// Make contents available as a {{>content}} partial
		partials = { content: contentDescriptor || [] };

		// TODO don't clone parent node - instead use a document fragment (and pass in the namespaceURI
		// of the parent node, for SVG purposes) and insert contents that way?
		instance = new Component({
			el: parentFragment.pNode.cloneNode( false ), // to ensure correct namespaceURI
			data: data,
			partials: partials,
			_parent: root,
			adaptors: root.adaptors
		});

		// Need to store references in both directions
		instance.component = component;
		component.instance = instance;

		// Insert the component into the current document fragment...
		instance.insert( docFrag );

		// ...and reset node reference
		instance.fragment.pNode = parentFragment.pNode;

		return instance;
	};

});