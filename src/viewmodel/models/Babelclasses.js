var Context___createClass = (function () {
	function defineProperties(target, props) {
		for (var key in props) {
			var prop = props[key];
			prop.configurable = true;
			if (prop.value) prop.writable = true;
		}
		Object.defineProperties(target, props);
	}
	return function (Constructor, protoProps, staticProps) {
		if (protoProps) defineProperties(Constructor.prototype, protoProps);
		if (staticProps) defineProperties(Constructor, staticProps);
		return Constructor;
	};
})();

function Context___inherits(subClass, superClass) {
	if (typeof superClass !== "function" && superClass !== null) {
		throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
	}

	subClass.prototype = Object.create(superClass && superClass.prototype, {
		constructor: { value: subClass, enumerable: false, writable: true, configurable: true }
	});

	if (superClass) subClass.__proto__ = superClass;

};

function Context__get(object, property, receiver) {
	var desc = Object.getOwnPropertyDescriptor(object, property);
	if (desc === undefined) {
		var parent = Object.getPrototypeOf(object);
		if (parent === null) {
			return undefined;
		}
		else {
			return Context__get(parent, property, receiver);
		}
	}
	else if ("value" in desc && desc.writable) {
		return desc.value;
	}
	else {
		var getter = desc.get;
		if (getter === undefined) {
			return undefined;
		}
		return getter.call(receiver);
	}
};

