import { create, toPairs } from 'utils/object';
import { isFunction, isObjectType } from 'utils/is';

export default function subscribe(instance, options, type) {
	const subs = (instance.constructor[`_${type}`] || []).concat(
		toPairs(options[type] || [])
	);
	const single = type === 'on' ? 'once' : `${type}Once`;

	subs.forEach(([target, config]) => {
		if (isFunction(config)) {
			instance[type](target, config);
		} else if (isObjectType(config) && isFunction(config.handler)) {
			instance[config.once ? single : type](
				target,
				config.handler,
				create(config)
			);
		}
	});
}
