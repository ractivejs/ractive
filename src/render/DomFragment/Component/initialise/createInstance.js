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

		instance = new Component({
			el: parentFragment.pNode,
			append: true,
			data: data,
			partials: partials,
			_parent: root,
			adapt: root.adapt
		});

		// Need to store references in both directions
		instance.component = component;
		component.instance = instance;

		// The component may be in the wrong place! This is because we
		// are still populating the document fragment that will be appended
		// to its parent node. So even though the component is *already*
		// a child of the parent node, we need to detach it, then insert
		// it into said document fragment, so that order is maintained
		// (both figuratively and literally).
		instance.insert( docFrag );

		// (After inserting, we need to reset the node reference)
		instance.fragment.pNode = instance.el = parentFragment.pNode;

		return instance;
	};

});