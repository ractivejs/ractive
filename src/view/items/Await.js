import { ATTRIBUTE, CATCH, ELEMENT, ELSE, INTERPOLATOR, SECTION, THEN } from 'src/config/types';
import Partial from './Partial';
import { assign } from 'utils/object';
import { isFunction } from 'utils/is';

function extract ( tpl, type, name ) {
	const p = tpl.f.find( s => s.t === type );
	if ( p ) {
		if ( p.n ) return [{ t: 19, n: 54, f: p.f || [], z: [{ n: p.n, x: { r: `__await.${name}` } }] }];
		else return p.f || [];
	} else return [];
}

export default function Await ( options ) {
	const tpl = options.template;

	const success = extract( tpl, THEN, 'value' );
	const error = extract( tpl, CATCH, 'error' );
	const pending = extract( tpl, SECTION );
	const undef = extract( tpl, ELSE );

	const opts = assign( {}, options, {
		template: { t: ELEMENT, m: [{ t: ATTRIBUTE, n: 'for', f: [{ t: INTERPOLATOR, r: tpl.r, rx: tpl.rx, x: tpl.x }] }] },
		macro ( handle, attrs ) {
			handle.aliasLocal( '__await' );

			function update ( attrs ) {
				if ( attrs.for && isFunction( attrs.for.then ) ) {
					handle.setTemplate( pending );

					attrs.for.then( v => {
						handle.set( '@local.value', v );
						handle.setTemplate( success );
					}, e => {
						handle.set( '@local.error', e );
						handle.setTemplate( error );
					});
				} else if ( attrs.for === undefined ) {
					handle.setTemplate( undef );
				} else {
					handle.set( '@local.value', attrs.for );
					handle.setTemplate( success );
				}
			}

			update( attrs );

			return {
				update
			};
		}
	});

	opts.macro.attributes = [ 'for' ];

	return new Partial( opts );
}


