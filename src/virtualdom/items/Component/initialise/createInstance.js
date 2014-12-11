import types from 'config/types';
import log from 'utils/log/log';
import create from 'utils/create';
import initialise from 'Ractive/initialise';
import extend from 'utils/extend';

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
		partials: partials,
		magic: ractive.magic || Component.defaults.magic,
		modifyArrays: ractive.modifyArrays,
		// need to inherit runtime parent adaptors
		adapt: ractive.adapt
	}, {
		parent: ractive,
		component: component,
		container: container,
		mappings: parameters.mappings,
		inlinePartials: inlinePartials
	});

	return instance;
}
