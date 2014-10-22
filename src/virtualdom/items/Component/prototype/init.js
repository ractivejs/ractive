import types from 'config/types';
import runloop from 'global/runloop';
import warn from 'utils/warn';
import parseJSON from 'utils/parseJSON';
import createReferenceResolver from 'virtualdom/items/shared/Resolvers/createReferenceResolver';
import ExpressionResolver from 'virtualdom/items/shared/Resolvers/ExpressionResolver';
import ReferenceExpressionResolver from 'virtualdom/items/shared/Resolvers/ReferenceExpressionResolver/ReferenceExpressionResolver';
import ComponentParameter from 'virtualdom/items/Component/initialise/ComponentParameter';
import createInstance from 'virtualdom/items/Component/initialise/createInstance';
import propagateEvents from 'virtualdom/items/Component/initialise/propagateEvents';
import updateLiveQueries from 'virtualdom/items/Component/initialise/updateLiveQueries';
import decodeKeypath from 'shared/decodeKeypath';

export default function Component$init ( options, Component ) {
	var component = this,
		parentFragment,
		root,
		data = {},
		mappings = {},
		mappingTemplates;

	parentFragment = component.parentFragment = options.parentFragment;
	root = parentFragment.root;

	component.root = root;
	component.type = types.COMPONENT;
	component.name = options.template.e;
	component.index = options.index;
	component.indexRefBindings = {};

	// even though only one yielder is allowed, we need to have an array of them
	// as it's possible to cause a yielder to be created before the last one
	// was destroyed in the same turn of the runloop
	component.yielders = [];

	if ( !Component ) {
		throw new Error( 'Component "' + component.name + '" not found' );
	}

	component.resolvers = [];
	component.complexParameters = [];

	mappingTemplates = options.template.a;

	if ( mappingTemplates ) {
		Object.keys( mappingTemplates ).forEach( key => {
			var template, parsed, ref, resolver, resolve, ready, resolved, param, mapping;

			template = mappingTemplates[ key ];

			if ( typeof template === 'string' ) {
				// We have static data
				parsed = parseJSON( template );
				data[ key ] = parsed ? parsed.value : template;
			}

			else if ( template === 0 ) {
				// Empty string
				// TODO valueless attributes also end up here currently
				// (i.e. `<widget bool>` === `<widget bool=''>`) - this
				// is probably incorrect
				data[ key ] = undefined;
			}

			else {
				if ( template.length === 1 && template[0].t === types.INTERPOLATOR ) {
					resolve = keypath => {
						var isSpecial, value;

						resolved = true;

						if ( keypath[0] === '@' ) {
							isSpecial = true;
							value = decodeKeypath( keypath );

							if ( ready ) {
								component.instance.viewmodel.set( key, value );
							} else {
								data[ key ] = value;
							}
						}

						else {
							if ( ready ) {
								mapping = component.instance.viewmodel.mappings[ key ];
								mapping.resolve( keypath );
							} else {
								mappings[ key ] = {
									origin: component.root.viewmodel,
									keypath: keypath
								};
							}
						}

						// TODO trace back to origin, not parent - may not be
						// component.root.viewmodel
						/*if ( ready ) {
							if ( isSpecial ) {
								component.instance.viewmodel.set( key, value );
							} else {
								component.instance.viewmodel.map( component.root.viewmodel, keypath, key );
							}
						} else {
							if ( isSpecial ) {
								data[ key ] = value;
							} else {

							}
						}*/
					};

					if ( ref = template[0].r ) {
						resolver = createReferenceResolver( component, template[0].r, resolve );
					} else if ( template[0].x ) {
						resolver = new ExpressionResolver( component, parentFragment, template[0].x, resolve );
					} else if ( template[0].rx ) {
						resolver = new ReferenceExpressionResolver( component, template[0].rx, resolve );
					}

					ready = true;

					component.resolvers.push( resolver );

					if ( !resolved ) {
						// note the mapping anyway, for the benefit of child
						// components
						mappings[ key ] = { origin: component.root.viewmodel };
					}
				}

				else {
					// We have a 'complex' parameter, e.g.
					// `<widget foo='{{bar}} {{baz}}'/>`
					param = new ComponentParameter( component, key, template );
					data[ key ] = param.value;
					component.complexParameters.push( param );
				}
			}
		});
	}

	createInstance( this, Component, data, mappings, options.template.f );
	propagateEvents( this, options.template.v );


	// intro, outro and decorator directives have no effect
	if ( options.template.t1 || options.template.t2 || options.template.o ) {
		warn( 'The "intro", "outro" and "decorator" directives have no effect on components' );
	}

	updateLiveQueries( this );
}
