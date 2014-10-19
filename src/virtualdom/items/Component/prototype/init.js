import types from 'config/types';
import warn from 'utils/warn';
import parseJSON from 'utils/parseJSON';
import createReferenceResolver from 'virtualdom/items/shared/Resolvers/createReferenceResolver';
import ExpressionResolver from 'virtualdom/items/shared/Resolvers/ExpressionResolver';
import ReferenceExpressionResolver from 'virtualdom/items/shared/Resolvers/ReferenceExpressionResolver/ReferenceExpressionResolver';
import ComponentParameter from 'virtualdom/items/Component/initialise/ComponentParameter';
import createInstance from 'virtualdom/items/Component/initialise/createInstance';
import propagateEvents from 'virtualdom/items/Component/initialise/propagateEvents';
import updateLiveQueries from 'virtualdom/items/Component/initialise/updateLiveQueries';

export default function Component$init ( options, Component ) {
	var component = this,
		parentFragment,
		root,
		data = {},
		mappingTemplates;

	parentFragment = component.parentFragment = options.parentFragment;
	root = parentFragment.root;

	component.root = root;
	component.type = types.COMPONENT;
	component.name = options.template.e;
	component.index = options.index;
	component.indexRefBindings = {};
	component.bindings = [];

	component.mappings = {};

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
			var template, parsed, ref, resolver, resolve, fragment, value;

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
						component.mappings[ key ] = {
							origin: component.root, // TODO trace back to origin, not parent
							keypath: keypath
						};
					};

					if ( ref = template[0].r ) {
						if ( ref in parentFragment.indexRefs ) {
							value = parentFragment.indexRefs[ ref ];

							// Need to find the list section the index refers to, for rebinding
							// TODO there must be a better way
							fragment = parentFragment;

							while ( fragment ) {
								if ( fragment.owner.template.i === ref ) {
									// TODO make it possible to unregister
									// TODO create class to do this work, rather than anon function
									component.root.viewmodel.registerSpecial( fragment.owner.keypath, value, {
										setValue: value => component.instance.viewmodel.set( key, value )
									});
									data[ key ] = value;
									return;
								}

								fragment = fragment.parent;
							}
						}

						resolver = createReferenceResolver( component, template[0].r, resolve );
					} else if ( template[0].x ) {
						resolver = new ExpressionResolver( component, parentFragment, template[0].x, resolve );
					} else if ( template[0].rx ) {
						resolver = new ReferenceExpressionResolver( component, template[0].rx, resolve );
					}

					component.resolvers.push( resolver );
				}

				else {
					// We have a 'complex' parameter, e.g.
					// `<widget foo='{{bar}} {{baz}}'/>`
					component.complexParameters.push( new ComponentParameter( component, key, template ) );
				}
			}
		});
	}


	createInstance( this, Component, data, options.template.f );
	propagateEvents( this, options.template.v );

	Object.keys( component.mappings ).forEach( key => {
		var mapping, parentValue, childValue;

		mapping = component.mappings[ key ];

		parentValue = mapping.origin.viewmodel.get( mapping.keypath );

		if ( parentValue === undefined ) {
			childValue = component.instance.viewmodel.get( key );

			if ( childValue !== undefined ) {
				mapping.origin.viewmodel.set( mapping.keypath, childValue );
			}
		}
	});


	// intro, outro and decorator directives have no effect
	if ( options.template.t1 || options.template.t2 || options.template.o ) {
		warn( 'The "intro", "outro" and "decorator" directives have no effect on components' );
	}

	updateLiveQueries( this );
}
