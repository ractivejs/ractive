import './Object.defineProperty';

// NOTE: The original legacy.js definition of Object.defineProperties wasn't
// fancy. All it did was reuse Object.defineProperty which is also potentially
// polyfilled.
{
	const isDefinePropertiesWorking = function () {
		try {
			Object.defineProperties({}, { test: { value: 0 } });
			if (document) Object.defineProperties(document.createElement('div'), { test: { value: 0 } });
			return true;
		} catch (err) {
			return false;
		}
	};

	if (!isDefinePropertiesWorking()) {
		Object.defineProperties = function (obj, props) {
			for (const prop in props) {
				if (!Object.hasOwnProperty.call(props, prop)) continue;
				Object.defineProperty(obj, prop, props[prop]);
			}
		};
	}
}
