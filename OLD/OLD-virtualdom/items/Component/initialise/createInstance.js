import { INTERPOLATOR, YIELDER } from 'config/types';
import { warnIfDebug } from 'utils/log';
import { create, extend } from 'utils/object';
import { isArray } from 'utils/is';
import parseJSON from 'utils/parseJSON';
import initialise from 'Ractive/initialise';
import ComplexParameter from './ComplexParameter';
import { getByTemplate } from 'viewmodel/prototype/getContext'; // TEMP

export default function ( component, Component, attributes, yieldTemplate, partials ) {
	var instance, parentFragment, ractive, fragment, container, inlinePartials = {}, data = {}, mappings = [], ready, resolvers = [];

	parentFragment = component.parentFragment;
	ractive = component.root;

	partials = partials || {};
	extend( inlinePartials, partials );

	// Make contents available as a {{>content}} partial
	partials.content = yieldTemplate || [];

	// set a default partial for yields with no name
	inlinePartials[''] = partials.content;

	if ( Component.defaults.el ) {
		warnIfDebug( 'The <%s/> component has a default `el` property; it has been disregarded', component.name );
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

	// each attribute represents either a) data or b) a mapping
	if ( attributes ) {
		Object.keys( attributes ).forEach( key => {
			var attribute = attributes[ key ], parsed, resolver, keypath;

			if ( typeof attribute === 'string' ) {
				// it's static data
				parsed = parseJSON( attribute );
				data[ key ] = parsed ? parsed.value : attribute;
			}

			else if ( attribute === 0 ) {
				// it had no '=', so we'll call it true
				data[ key ] = true;
			}

			else if ( isArray( attribute ) ) {
				// this represents dynamic data

				if ( isSingleInterpolator( attribute ) ) {
					mappings.push({
						key: key,
						model: getByTemplate( ractive.viewmodel, attribute[0], component )
					});
				}

				else {
					resolvers.push( new ComplexParameter( component, attribute, function ( keypath ) {
						if ( ready ) {
							instance.set( key, keypath.get() ); // TODO use viewmodel?
						} else {
							data[ key ] = keypath.get();
						}
					}) );
				}
			}

			else {
				throw new Error( 'erm wut' );
			}
		});
	}

	instance = create( Component.prototype );

	initialise( instance, {
		el: null,
		append: true,
		data,
		partials,
		magic: ractive.magic || Component.defaults.magic,
		modifyArrays: ractive.modifyArrays,
		// need to inherit runtime parent adaptors
		adapt: ractive.adapt
	}, {
		parent: ractive,
		component,
		container,
		mappings,
		inlinePartials,
		cssIds: parentFragment.cssIds
	});

	ready = true;
	component.resolvers = resolvers;

	return instance;
}

function isSingleInterpolator( template ){
	return template.length === 1 && template[0].t === INTERPOLATOR;
}
