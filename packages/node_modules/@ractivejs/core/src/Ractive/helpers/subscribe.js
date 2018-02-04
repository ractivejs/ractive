import { toPairs } from '../../utils/object';

export default function subscribe ( instance, options, type ) {
	const subs = ( instance.constructor[ `_${type}` ] || [] ).concat( toPairs( options[ type ] || [] ) );
	const single = type === 'on' ? 'once' : `${type}Once`;

	subs.forEach( ([ target, config ]) => {
		if ( typeof config === 'function' ) {
			instance[type]( target, config );
		} else if ( typeof config === 'object' && typeof config.handler === 'function' ) {
			instance[ config.once ? single : type ]( target, config.handler, config );
		}
	});
}

