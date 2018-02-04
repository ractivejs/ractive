import getFunction from '../../../shared/getFunction';
import resolveReference from '../../resolvers/resolveReference';

export function setupArgsFn ( item, template, fragment, opts = {} ) {
	if ( template && template.f && template.f.s ) {
		item.fn = getFunction( template.f.s, template.f.r.length );
		if ( opts.register === true ) {
			item.models = resolveArgs( item, template, fragment, opts );
		}
	}
}

export function resolveArgs ( item, template, fragment, opts = {} ) {
	return template.f.r.map( ( ref, i ) => {
		let model;

		if ( opts.specialRef && ( model = opts.specialRef( ref, i ) ) ) return model;

		model = resolveReference( fragment, ref );
		if ( opts.register === true ) {
			model.register( item );
		}

		return model;
	});
}

export function teardownArgsFn ( item, template ) {
	if ( template && template.f && template.f.s ) {
		if ( item.models ) item.models.forEach( m => {
			if ( m && m.unregister ) m.unregister( item );
		});
		item.models = null;
	}
}
