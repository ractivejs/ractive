// NOTE: The original legacy.js definition of Object.defineProperty wasn't
// fancy. It silently didn't support everything and only assigned value.
{
	const isDefinePropertyWorking = function () {
		try {
			Object.defineProperty({}, 'test', { get() { }, set() { } });
			if (document) Object.defineProperty(document.createElement('div'), 'test', { value: 0 });
			return true;
		} catch (err) {
			return false;
		}
	};

	if (!isDefinePropertyWorking()) {
		Object.defineProperty = function (obj, prop, desc) {
			obj[prop] = desc.get ? desc.get() : desc.value;
		};
	}
}
