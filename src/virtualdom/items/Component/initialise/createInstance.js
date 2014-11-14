import types from 'config/types';
import log from 'utils/log/log';
import create from 'utils/create';
import initialise from 'Ractive/initialise';

export default function ( component, Component, data, mappings, yieldTemplate ) {
	var instance, parentFragment, partials, ractive, fragment, container;

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

	// find container
	fragment = parentFragment;
	while ( fragment ) {
		if ( fragment.owner.type === types.YIELDER ) {
			container = fragment.owner.container;
			break;
		}

		fragment = fragment.parent;
	}

	instance = create( Component.prototype );

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
		parent: ractive,
		component: component,
		mappings: mappings,
		yieldTemplate: yieldTemplate,
		container: container
	});

	return instance;
}
