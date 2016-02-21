import { warnIfDebug } from '../utils/log';
import { getElement } from '../utils/dom';
import config from './config/config';
import Fragment from '../view/Fragment';
import Hook from '../events/Hook';
import HookQueue from '../events/HookQueue';
import Ractive from '../Ractive';
import { RENDER_FAILED } from '../messages/errors';

let configHook = new Hook( 'config' );
let initHook = new HookQueue( 'init' );

export default function initialise ( ractive, userOptions, options ) {
	Object.keys( ractive.viewmodel.computations ).forEach( key => {
		const computation = ractive.viewmodel.computations[ key ];

		if ( ractive.viewmodel.value.hasOwnProperty( key ) ) {
			computation.set( ractive.viewmodel.value[ key ] );
		}
	});

	// init config from Parent and options
	config.init( ractive.constructor, ractive, userOptions );

	configHook.fire( ractive );
	initHook.begin( ractive );

	let fragment;

	// Render virtual DOM
	if ( ractive.template ) {
		let cssIds;

		if ( options.cssIds || ractive.cssId ) {
			cssIds = options.cssIds ? options.cssIds.slice() : [];

			if ( ractive.cssId ) {
				cssIds.push( ractive.cssId );
			}
		}

		ractive.fragment = fragment = new Fragment({
			owner: ractive,
			template: ractive.template,
			cssIds,
			indexRefs: options.indexRefs || {},
			keyRefs: options.keyRefs || {}
		}).bind( ractive.viewmodel );
	}

	initHook.end( ractive );

	if ( fragment ) {
		// render automatically ( if `el` is specified )
		const el = getElement( ractive.el );
		if ( el ) {
			ractive.render( el, ractive.append ).catch( err => {
				if ( Ractive.DEBUG_PROMISES ) warnIfDebug( RENDER_FAILED, err.stack, { ractive });
				throw err;
			});
		}
	}
}
