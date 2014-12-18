import { INTERPOLATOR, YIELDER } from 'config/types';
import { warn } from 'utils/log';
import { create, extend } from 'utils/object';
import { isArray } from 'utils/is';
import parseJSON from 'utils/parseJSON';
import initialise from 'Ractive/initialise';
import createReferenceResolver from 'virtualdom/items/shared/Resolvers/createReferenceResolver';
import ExpressionResolver from 'virtualdom/items/shared/Resolvers/ExpressionResolver';
import ReferenceExpressionResolver from 'virtualdom/items/shared/Resolvers/ReferenceExpressionResolver/ReferenceExpressionResolver';
import ComplexParameter from './ComplexParameter';

export default function ( component, Component, attributes, yieldTemplate, partials ) {
	var instance, parentFragment, ractive, fragment, container, inlinePartials = {}, data = {}, mappings = {}, ready, resolvers = [];

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

	// each attribute represents either a) data or b) a mapping
	if ( attributes ) {
		Object.keys( attributes ).forEach( key => {
			var attribute = attributes[ key ], parsed, resolver;

			if ( typeof attribute === 'string' ) {
				// it's static data
				parsed = parseJSON( attribute );
				data[ key ] = parsed ? parsed.value : attribute;
			}
			
			else if ( isArray( attribute ) ) {
				// this represents dynamic data
				if ( isSingleInterpolator( attribute ) ) {
					resolver = createResolver( component, attribute[0], function ( keypath ) {
						if ( keypath.isSpecial ) {
							if ( ready ) {
								instance.set( key, keypath.value ); // TODO use viewmodel?
							} else {
								data[ key ] = keypath.value;
							}
						}

						else {
							if ( ready ) {
								instance.viewmodel.mappings[ key ].resolve( keypath );
							} else {
								// resolved immediately
								mappings[ key ] = {
									keypath: keypath,
									origin: component.root.viewmodel
								};
							}	
						}
					});
				}

				else {
					resolver = new ComplexParameter( component, attribute, function ( value ) {
						if ( ready ) {
							instance.set( key, value ); // TODO use viewmodel?
						} else {
							data[ key ] = value;
						}
					});
				}

				resolvers.push( resolver );
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
		data: data,
		partials: partials,
		magic: ractive.magic || Component.defaults.magic,
		modifyArrays: ractive.modifyArrays,
		// need to inherit runtime parent adaptors
		adapt: ractive.adapt
	}, {
		parent: ractive,
		component: component,
		container: container,
		mappings: mappings,
		inlinePartials: inlinePartials
	});

	ready = true;
	component.resolvers = resolvers;

	return instance;
}

function createResolver ( component, template, callback ) {
	var resolver;

	if ( template.r ) {
		resolver = createReferenceResolver( component, template.r, callback );
	}

	else if ( template.x ) {
		resolver = new ExpressionResolver( component, component.parentFragment, template.x, callback );
	}

	else if ( template.rx ) {
		resolver = new ReferenceExpressionResolver( component, template.rx, callback );
	}

	return resolver;
}

function isSingleInterpolator( template ){
	return template.length === 1 && template[0].t === INTERPOLATOR;
}