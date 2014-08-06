export default function ( component, Component, data, contentDescriptor ) {
	var instance, parentFragment, partials, root;

	parentFragment = component.parentFragment;
	root = component.root;

	// Make contents available as a {{>content}} partial
	partials = { content: contentDescriptor || [] };

	instance = new Component({
		el: null,
		append: true,
		data: data,
		partials: partials,
		magic: root.magic || Component.defaults.magic,
		modifyArrays: root.modifyArrays,
		_parent: root,
		_component: component,
		// need to inherit runtime parent adaptors
		adapt: root.adapt
	});

	return instance;
}
