import getFunction from '../../../shared/getFunction';
import resolveReference from '../../resolvers/resolveReference';
import { unbind } from '../../../shared/methodCallers';
import { removeFromArray } from '../../../utils/array';

export function setupArgsFn ( item, template, fragment, opts = {} ) {
	if ( template && template.f && template.f.s ) {
		item.fn = getFunction( template.f.s, template.f.r.length );
		if ( opts.register === true ) {
			item.models = resolveArgs( item, template, fragment, opts );
		}
	}
}

export function resolveArgs ( item, template, fragment, opts = {} ) {
	if ( opts.register === true ) {
		item.resolvers = [];
	}
	return template.f.r.map( ( ref, i ) => {
		let resolver, model;

		if ( opts.specialRef && ( model = opts.specialRef( ref, i ) ) ) return model;

		model = resolveReference( fragment, ref );
		if ( opts.register === true ) {
			if ( !model ) {
				resolver = fragment.resolve( ref, model => {
					item.models[i] = model;
					removeFromArray( item.resolvers, resolver );
					model.register( item );
				});

				item.resolvers.push( resolver );
			} else model.register( item );
		}

		return model;
	});
}

export function teardownArgsFn ( item, template ) {
	if ( template && template.f && template.f.s ) {
		if ( item.resolvers ) item.resolvers.forEach( unbind );
		item.resolvers = [];

		if ( item.models ) item.models.forEach( m => {
			if ( m && m.unregister ) m.unregister( item );
		});
		item.models = null;
	}
}
