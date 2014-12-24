import { YIELDER } from 'config/types';
import { warn } from 'utils/log';
import { create, extend } from 'utils/object';
import initialise from 'Ractive/initialise';

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
		warn( 'The <%s/> component has a default `el` property; it has been disregarded', component.name );
	}

	// find container
	fragment = parentFragment;
	while ( fragment ) {
		if ( fragment.owner.type === YIELDER ) {
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
