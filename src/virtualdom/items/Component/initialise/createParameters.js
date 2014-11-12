import ComponentParameter from 'virtualdom/items/Component/initialise/ComponentParameter';
import createReferenceResolver from 'virtualdom/items/shared/Resolvers/createReferenceResolver';
import decodeKeypath from 'shared/decodeKeypath';
import ExpressionResolver from 'virtualdom/items/shared/Resolvers/ExpressionResolver';
import parseJSON from 'utils/parseJSON';
import ReferenceExpressionResolver from 'virtualdom/items/shared/Resolvers/ReferenceExpressionResolver/ReferenceExpressionResolver';
import types from 'config/types';

export default function createParameters ( component, attributes) {
	var data = {}, mappings = {};

	if( attributes ) {
		create( component, attributes, data, mappings );
	}

	return { data: data, mappings: mappings };
}

function create( component, attributes, data, mappings ) {

	Object.keys( attributes ).forEach( key => {
		var template, parsed, ref, resolver, resolve, ready, resolved, param, mapping;

		template = attributes[ key ];

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
						//data[ key ] = component.root.viewmodel.get(keypath)
					}

					// TODO trace back to origin, not parent - may not be
					// this.root.viewmodel
					/*if ( ready ) {
						if ( isSpecial ) {
							this.instance.viewmodel.set( key, value );
						} else {
							this.instance.viewmodel.map( this.root.viewmodel, keypath, key );
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
					resolver = new ExpressionResolver( component, component.parentFragment, template[0].x, resolve );
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
