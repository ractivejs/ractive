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
