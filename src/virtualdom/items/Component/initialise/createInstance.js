import log from 'utils/log';

export default function ( component, Component, data, contentDescriptor ) {
	var instance, parentFragment, partials, ractive;

	parentFragment = component.parentFragment;
	ractive = component.root;

	// Make contents available as a {{>content}} partial
	partials = { content: contentDescriptor || [] };

	if ( Component.defaults.el ) {
		log.warn({
			debug: ractive.debug,
			message: 'defaultElSpecified',
			args: {
				name: component.name
			}
		});
	}

	instance = new Component({
		el: null,
		append: true,
		data: data,
		partials: partials,
		magic: ractive.magic || Component.defaults.magic,
		modifyArrays: ractive.modifyArrays,
		_parent: ractive,
		_component: component,
		// need to inherit runtime parent adaptors
		adapt: ractive.adapt
	});

	return instance;
}
