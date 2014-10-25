import log from 'utils/log';
import create from 'utils/create';
import circular from 'circular';

var initialise;

circular.push( () => {
	initialise = circular.initialise;
});

export default function ( component, Component, data, mappings, yieldTemplate ) {
	var instance, parentFragment, partials, ractive;

	parentFragment = component.parentFragment;
	ractive = component.root;

	// Make contents available as a {{>content}} partial
	partials = { content: yieldTemplate || [] };

	if ( Component.defaults.el ) {
		log.warn({
			debug: ractive.debug,
			message: 'defaultElSpecified',
			args: {
				name: component.name
			}
		});
	}

	instance = create( Component.prototype );
	component.instance = instance;

	// Add component-specific properties
	instance.component = component;
	instance._parent = ractive;
	instance._yield = yieldTemplate;

	initialise( instance, {
		el: null,
		append: true,
		data: data,
		partials: partials,
		magic: ractive.magic || Component.defaults.magic,
		modifyArrays: ractive.modifyArrays,
		// need to inherit runtime parent adaptors
		adapt: ractive.adapt
	}, {
		mappings: mappings
	});

	return instance;
}
