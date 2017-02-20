// NOTE: The following polyfills are constructed based on several reference
// materials which include the original legacy.js definitions, polyfills found
// in MDN (which roughly followed the ES6 spec), and open-source libs
// (es5-shim). All of which were rewritten to be compliant to the linter, and
// where readability and flow can be improved.
//
// TODO: Better presence checks (i.e. typeof thing === 'function')
// TODO: Better global attachments (i.e. Promise, requestAnimationFrame, etc.)
// TODO: Add references to relevant specs and sources
// TODO: Tests and coverage
// TODO: Optimizations

// Array.isArray
if (!Array.isArray) {
	Array.isArray = function (arg) {
		return Object.prototype.toString.call(arg) === '[object Array]';
	};
}

// Array.prototype.every
if (!Array.prototype.every) {
	Array.prototype.every = function (callback, thisArg) {
		if (this === null || this === undefined)
			throw new TypeError('Array.prototype.every called on null or undefined');

		if (typeof callback !== 'function')
			throw new TypeError(`${callback} is not a function`);

		const array = Object(this);
		const arrayLength = array.length >>> 0;

		for (let index = 0; index < arrayLength; index++) {
			if (!Object.hasOwnProperty.call(array, index)) continue;
			if (!callback.call(thisArg, array[index], index, array)) return false;
		}

		return true;
	};
}

// Array.prototype.filter
if (!Array.prototype.filter) {
	Array.prototype.filter = function (callback, thisArg) {
		if (this === null || this === undefined)
			throw new TypeError('Array.prototype.filter called on null or undefined');

		if (typeof callback !== 'function')
			throw new TypeError(`${callback} is not a function`);

		const array = Object(this);
		const arrayLength = array.length >>> 0;
		const results = [];

		for (let index = 0; index < arrayLength; index++) {
			if (!Object.hasOwnProperty.call(array, index)) continue;
			if (!callback.call(thisArg, array[index], index, array)) continue;
			results.push(array[index]);
		}

		return results;
	};
}

// Array.prototype.find
if (!Array.prototype.find) {
	Array.prototype.find = function (callback, thisArg) {
		if (this === null || this === undefined)
			throw new TypeError('Array.prototype.find called on null or undefined');

		if (typeof callback !== 'function')
			throw new TypeError(`${callback} is not a function`);

		const array = Object(this);
		const arrayLength = array.length >>> 0;

		for (let index = 0; index < arrayLength; index++) {
			if (!Object.hasOwnProperty.call(array, index)) continue;
			if (!callback.call(thisArg, array[index], index, array)) continue;
			return array[index];
		}

		return undefined;
	};
}

// Array.prototype.forEach
if (!Array.prototype.forEach) {
	Array.prototype.forEach = function (callback, thisArg) {
		if (this === null || this === undefined)
			throw new TypeError('Array.prototype.forEach called on null or undefined');

		if (typeof callback !== 'function')
			throw new TypeError(`${callback} is not a function`);

		const array = Object(this);
		const arrayLength = array.length >>> 0;

		for (let index = 0; index < arrayLength; index++) {
			if (!Object.hasOwnProperty.call(array, index)) continue;
			callback.call(thisArg, array[index], index, array);
		}

		return undefined;
	};
}

// Array.prototype.indexOf
if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function (searchElement, fromIndex) {
		if (this === null || this === undefined)
			throw new TypeError('Array.prototype.indexOf called on null or undefined');

		const array = Object(this);
		const arrayLength = array.length >>> 0;
		const fromIndexInt = fromIndex >>> 0;
		const fromIndexAdjusted = Math.max(fromIndexInt >= 0 ? fromIndexInt : arrayLength - Math.abs(fromIndexInt), 0);

		for (let index = fromIndexAdjusted; index < arrayLength; index++) {
			if (!Object.hasOwnProperty.call(array, index)) continue;
			if (array[index] !== searchElement) continue;
			return index;
		}

		return -1;
	};
}

// Array.prototype.map
if (!Array.prototype.map) {
	Array.prototype.map = function (callback, thisArg) {
		if (this === null || this === undefined)
			throw new TypeError('Array.prototype.map called on null or undefined');

		if (typeof callback !== 'function')
			throw new TypeError(`${callback} is not a function`);

		const array = Object(this);
		const arrayLength = array.length >>> 0;
		const results = [];

		for (let index = 0; index < arrayLength; index++) {
			if (!Object.hasOwnProperty.call(array, index)) continue;
			results[index] = callback.call(thisArg, array[index], index, array);
		}

		return results;
	};
}

// Array.prototype.reduce
if (!Array.prototype.reduce) {
	Array.prototype.reduce = function (callback, initialValue) {
		if (this === null || this === undefined)
			throw new TypeError('Array.prototype.map called on null or undefined');

		if (typeof callback !== 'function')
			throw new TypeError(`${callback} is not a function`);

		const array = Object(this);
		const arrayLength = array.length >>> 0;
		const isInitialValuePresent = arguments.length === 2;

		let index = 0;
		let accumulator = undefined;

		if (isInitialValuePresent) {
			accumulator = initialValue;
		} else {
			let isViableInitialValueFromArray = false;

			for (; !isViableInitialValueFromArray && index < arrayLength; index++) {
				isViableInitialValueFromArray = Object.prototype.hasOwnProperty.call(array, index);
				if (isViableInitialValueFromArray) accumulator = array[index];
			}

			if (!isViableInitialValueFromArray)
				throw new TypeError('Reduce of empty array with no initial value');
		}

		for (; index < arrayLength; index++) {
			if (!Object.prototype.hasOwnProperty.call(array, index)) continue;
			accumulator = callback.call(undefined, accumulator, array[index], index, array);
		}

		return accumulator;
	};
}

// Date.now
if (!Date.now) {
	Date.now = function () {
		return new Date().getTime();
	};
}

// Function.prototype.bind
if (!Function.prototype.bind) {
	Function.prototype.bind = function (thisArg, ...args) {
		if (typeof this !== 'function')
			throw new TypeError('Bind must be called on a function');

		const target = this;

		const BoundFunctionParent = function () { };
		BoundFunctionParent.prototype = this.prototype || BoundFunctionParent.prototype;

		const boundFunction = function (...callArgs) {
			const isCalledAsConstructor = this instanceof BoundFunctionParent;
			return target.apply(isCalledAsConstructor ? this : thisArg, [...args, ...callArgs]);
		};
		boundFunction.prototype = new BoundFunctionParent();

		return boundFunction;
	};
}

// Object.assign
if (!Object.assign) {
	Object.assign = function (target, ...sources) {
		if (target == null)
			throw new TypeError('Cannot convert undefined or null to object');

		const to = Object(target);
		const sourcesLength = sources.length;

		for (let index = 0; index < sourcesLength; index++) {
			const nextSource = sources[index];
			for (const nextKey in nextSource) {
				if (!Object.prototype.hasOwnProperty.call(nextSource, nextKey)) continue;
				to[nextKey] = nextSource[nextKey];
			}
		}

		return to;
	};
}

// Object.create
if (!Object.create) {
	const EmptyConstructor = function () { };

	Object.create = function (prototype = {}, properties = {}) {
		if (prototype !== Object(prototype) && prototype !== null)
			throw TypeError('Object prototype may only be an Object or null');

		EmptyConstructor.prototype = prototype;
		const result = new EmptyConstructor();
		Object.defineProperties(result, properties);
		result.__proto__ = prototype;

		return result;
	};
}

// Object.defineProperty
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

// Object.defineProperties
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

// Object.freeze
// NOTE: This just adds Object.freeze presence. Nothing can be done.
if (!Object.freeze) {
	Object.freeze = function (obj) {
		return obj;
	};
}

// Object.keys
if (!Object.keys) {
	const hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString');
	const dontEnumProps = ['__proto__', 'toString', 'toLocaleString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'constructor'];
	const dontEnumPropsLength = dontEnumProps.length;

	Object.keys = function (obj) {
		if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null))
			throw new TypeError('Object.keys called on non-object');

		const result = [];

		for (const prop in obj) {
			if (!Object.prototype.hasOwnProperty.call(obj, prop)) continue;
			result.push(prop);
		}

		if (hasDontEnumBug) {
			for (let index = 0; index < dontEnumPropsLength; index++) {
				if (!Object.prototype.hasOwnProperty.call(obj, dontEnumProps[index])) continue;
				result.push(dontEnumProps[index]);
			}
		}

		return result;
	};
}

// Promise
// TODO: Better global attachment
if (window && !window.Promise) {
	const PENDING = {};
	const FULFILLED = {};
	const REJECTED = {};

	const Promise = window.Promise = function (callback) {
		const fulfilledHandlers = [];
		const rejectedHandlers = [];
		let state = PENDING;
		let result;
		let dispatchHandlers;

		const makeResolver = (newState) => {
			return function (value) {
				if (state !== PENDING) return;
				result = value;
				state = newState;
				dispatchHandlers = makeDispatcher((state === FULFILLED ? fulfilledHandlers : rejectedHandlers), result);
				wait(dispatchHandlers);
			};
		};

		const fulfill = makeResolver(FULFILLED);
		const reject = makeResolver(REJECTED);

		try {
			callback(fulfill, reject);
		} catch (err) {
			reject(err);
		}

		return {
			// `then()` returns a Promise - 2.2.7
			then(onFulfilled, onRejected) {
				const promise2 = new Promise((fulfill, reject) => {

					const processResolutionHandler = (handler, handlers, forward) => {
						if (typeof handler === 'function') {
							handlers.push(p1result => {
								try {
									resolve(promise2, handler(p1result), fulfill, reject);
								} catch (err) {
									reject(err);
								}
							});
						} else {
							handlers.push(forward);
						}
					};

					processResolutionHandler(onFulfilled, fulfilledHandlers, fulfill);
					processResolutionHandler(onRejected, rejectedHandlers, reject);

					if (state !== PENDING) {
						wait(dispatchHandlers);
					}

				});
				return promise2;
			},
			'catch'(onRejected) {
				return this.then(null, onRejected);
			}
		};
	};

	Promise.all = function (promises) {
		return new Promise((fulfil, reject) => {
			const result = [];
			let pending;
			let i;

			if (!promises.length) {
				fulfil(result);
				return;
			}

			const processPromise = (promise, i) => {
				if (promise && typeof promise.then === 'function') {
					promise.then(value => {
						result[i] = value;
						--pending || fulfil(result);
					}, reject);
				} else {
					result[i] = promise;
					--pending || fulfil(result);
				}
			};

			pending = i = promises.length;

			while (i--) {
				processPromise(promises[i], i);
			}
		});
	};

	Promise.resolve = function (value) {
		return new Promise(fulfill => {
			fulfill(value);
		});
	};

	Promise.reject = function (reason) {
		return new Promise((fulfill, reject) => {
			reject(reason);
		});
	};

	// TODO use MutationObservers or something to simulate setImmediate
	const wait = function (callback) {
		setTimeout(callback, 0);
	};

	const makeDispatcher = function (handlers, result) {
		return function () {
			for (let handler; handler = handlers.shift();) {
				handler(result);
			}
		};
	};

	const resolve = function (promise, x, fulfil, reject) {
		let then;
		if (x === promise) {
			throw new TypeError(`A promise's fulfillment handler cannot return the same promise`);
		}
		if (x instanceof Promise) {
			x.then(fulfil, reject);
		} else if (x && (typeof x === 'object' || typeof x === 'function')) {
			try {
				then = x.then;
			} catch (e) {
				reject(e);
				return;
			}
			if (typeof then === 'function') {
				let called;

				const resolvePromise = function (y) {
					if (called) return;
					called = true;
					resolve(promise, y, fulfil, reject);
				};
				const rejectPromise = function (r) {
					if (called) return;
					called = true;
					reject(r);
				};

				try {
					then.call(x, resolvePromise, rejectPromise);
				} catch (e) {
					if (!called) {
						reject(e);
						called = true;
						return;
					}
				}
			} else {
				fulfil(x);
			}
		} else {
			fulfil(x);
		}
	};

}

// String.prototype.trim
if (!String.prototype.trim) {
	String.prototype.trim = function () {
		return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
	};
}

// Node.prototype.contains
// NOTE: Node doesn't exist in IE8. Nothing can be done.
if (window && window.Node && window.Node.prototype && !window.Node.prototype.contains) {
	Node.prototype.contains = function (node) {
		if (!node)
			throw new TypeError('node required');

		do {
			if (this === node) return true;
		} while (node = node && node.parentNode);

		return false;
	};
}

// performance.now
// NOTE: Setup requires Date.now() to be present already.
if (window && window.performance && !window.performance.now) {
	window.performance = window.performance || {};

	const nowOffset = Date.now();

	window.performance.now = function () {
		return Date.now() - nowOffset;
	};
}

// requestAnimationFrame
// cancelAnimationFrame
if (window && !(window.requestAnimationFrame && window.cancelAnimationFrame)) {
	let lastTime = 0;
	window.requestAnimationFrame = function (callback) {
		const currentTime = Date.now();
		const timeToNextCall = Math.max(0, 16 - (currentTime - lastTime));
		const id = window.setTimeout(() => { callback(currentTime + timeToNextCall); }, timeToNextCall);
		lastTime = currentTime + timeToNextCall;
		return id;
	};
	window.cancelAnimationFrame = function (id) {
		clearTimeout(id);
	};
}

// addEventListener
// removeEventListener
// https://gist.github.com/Rich-Harris/6010282 via https://gist.github.com/jonathantneal/2869388
if (document && window && !(window.addEventListener && window.removeEventListener)) {

	const Event = function (e, element) {
		const instance = this;

		for (const property in e) {
			instance[property] = e[property];
		}

		instance.currentTarget = element;
		instance.target = e.srcElement || element;
		instance.timeStamp = +new Date();

		instance.preventDefault = function () {
			e.returnValue = false;
		};

		instance.stopPropagation = function () {
			e.cancelBubble = true;
		};
	};

	const addEventListener = function (type, listener) {
		const element = this;
		const listeners = element.listeners || (element.listeners = []);
		const i = listeners.length;

		listeners[i] = [listener, e => { listener.call(element, new Event(e, element)); }];
		element.attachEvent('on' + type, listeners[i][1]);
	};

	const removeEventListener = function (type, listener) {
		const element = this;

		if (!element.listeners) return;

		const listeners = element.listeners;
		let i = listeners.length;

		while (i--) {
			if (listeners[i][0] !== listener) continue;
			element.detachEvent('on' + type, listeners[i][1]);
		}
	};

	window.addEventListener = document.addEventListener = addEventListener;
	window.removeEventListener = document.removeEventListener = removeEventListener;

	if ('Element' in window) {
		window.Element.prototype.addEventListener = addEventListener;
		window.Element.prototype.removeEventListener = removeEventListener;
	} else {
		// First, intercept any calls to document.createElement - this is necessary
		// because the CSS hack (see below) doesn't come into play until after a
		// node is added to the DOM, which is too late for a lot of Ractive setup work
		const origCreateElement = document.createElement;

		document.createElement = function (tagName) {
			const el = origCreateElement(tagName);
			el.addEventListener = addEventListener;
			el.removeEventListener = removeEventListener;
			return el;
		};

		// Then, mop up any additional elements that weren't created via
		// document.createElement (i.e. with innerHTML).
		const head = document.getElementsByTagName('head')[0];
		const style = document.createElement('style');

		head.insertBefore(style, head.firstChild);

		//style.styleSheet.cssText = '*{-ms-event-prototype:expression(!this.addEventListener&&(this.addEventListener=addEventListener)&&(this.removeEventListener=removeEventListener))}';
	}
}

// window.getComputedStyle
// https://github.com/jonathantneal/Polyfills-for-IE8/blob/master/getComputedStyle.js
if (document && window && !window.getComputedStyle) {

	const noop = function () { };
	const borderSizes = {};
	const normalProps = {
		fontWeight: 400,
		lineHeight: 1.2, // actually varies depending on font-family, but is generally close enough...
		letterSpacing: 0
	};

	const getPixelSize = function (element, style, property, fontSize) {
		const value = style[property];
		const rawSize = parseFloat(value);
		const rawUnit = value.split(/\d/)[0];
		const isMeasureNotSizeAndUnit = isNaN(rawSize) && /^thin|medium|thick$/.test(value);
		const size = isMeasureNotSizeAndUnit ? getBorderPixelSize(value) : rawSize;
		const unit = isMeasureNotSizeAndUnit ? '' : rawUnit;

		fontSize = fontSize != null ? fontSize
			: /%|em/.test(unit) && element.parentElement ? getPixelSize(element.parentElement, element.parentElement.currentStyle, 'fontSize', null)
				: 16;

		const rootSize = property == 'fontSize' ? fontSize
			: /width/i.test(property) ? element.clientWidth
				: element.clientHeight;

		return (unit == 'em') ? size * fontSize
			: (unit == 'in') ? size * 96
				: (unit == 'pt') ? size * 96 / 72
					: (unit == '%') ? size / 100 * rootSize
						: size;
	};

	const getBorderPixelSize = function (size) {

		// `thin`, `medium` and `thick` vary between browsers. (Don't ever use them.)
		if (!borderSizes[size]) {
			const div = document.createElement('div');
			div.style.display = 'block';
			div.style.position = 'fixed';
			div.style.width = div.style.height = '0';
			div.style.borderRight = size + ' solid black';
			document.getElementsByTagName('body')[0].appendChild(div);

			const bcr = div.getBoundingClientRect();

			borderSizes[size] = bcr.right - bcr.left;
		}

		return borderSizes[size];
	};

	const setShortStyleProperty = function (style, property) {
		const borderSuffix = property == 'border' ? 'Width' : '';
		const t = `${property}Top${borderSuffix}`;
		const r = `${property}Right${borderSuffix}`;
		const b = `${property}Bottom${borderSuffix}`;
		const l = `${property}Left${borderSuffix}`;

		style[property] = (style[t] == style[r] == style[b] == style[l] ? [style[t]]
			: style[t] == style[b] && style[l] == style[r] ? [style[t], style[r]]
				: style[l] == style[r] ? [style[t], style[r], style[b]]
					: [style[t], style[r], style[b], style[l]]).join(' ');
	};

	const CSSStyleDeclaration = function (element) {

		const style = this;
		const currentStyle = element.currentStyle;
		const fontSize = getPixelSize(element, currentStyle, 'fontSize', null);

		// TODO tidy this up, test it, send PR to jonathantneal!
		for (const property in currentStyle) {
			if (currentStyle[property] === 'normal' && normalProps.hasOwnProperty(property)) {
				style[property] = normalProps[property];
			} else if (/width|height|margin.|padding.|border.+W/.test(property)) {
				if (currentStyle[property] === 'auto') {
					if (/^width|height/.test(property)) {
						// just use clientWidth/clientHeight...
						style[property] = (property === 'width' ? element.clientWidth : element.clientHeight) + 'px';
					} else if (/(?:padding)?Top|Bottom$/.test(property)) {
						style[property] = '0px';
					}
				} else {
					style[property] = getPixelSize(element, currentStyle, property, fontSize) + 'px';
				}
			} else if (property === 'styleFloat') {
				style.float = currentStyle[property];
			} else {
				style[property] = currentStyle[property];
			}
		}

		setShortStyleProperty(style, 'margin');
		setShortStyleProperty(style, 'padding');
		setShortStyleProperty(style, 'border');

		style.fontSize = fontSize + 'px';

		return style;
	};

	CSSStyleDeclaration.prototype = {
		constructor: CSSStyleDeclaration,
		getPropertyPriority: noop,
		getPropertyValue(prop) {
			return this[prop] || '';
		},
		item: noop,
		removeProperty: noop,
		setProperty: noop,
		getPropertyCSSValue: noop
	};

	window.getComputedStyle = function (element) {
		return new CSSStyleDeclaration(element);
	};
}
