import types from 'config/types';
import log from 'utils/log/log';
import create from 'utils/create';
import circular from 'circular';
import extend from 'utils/extend';

var initialise;

circular.push( () => {
	initialise = circular.initialise;
});

export default function ( component, Component, parameters, yieldTemplate, partials ) {
	var instance, parentFragment, ractive, fragment, container, inlinePartials = {};

	parentFragment = component.parentFragment;
	ractive = component.root;

	partials = partials || {};
	extend( inlinePartials, partials || {} );

	// Make contents available as a {{>content}} partial
	partials.content = yieldTemplate || [];

	// set a default partial for yields with no name
	inlinePartials[''] = partials.content;

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
		data: parameters.data,
		inlinePartials: inlinePartials,
		partials: partials,
		magic: ractive.magic || Component.defaults.magic,
		modifyArrays: ractive.modifyArrays,
		// need to inherit runtime parent adaptors
		adapt: ractive.adapt
	}, {
		parent: ractive,
		component: component,
		mappings: parameters.mappings,
		container: container
	});

	return instance;
}
