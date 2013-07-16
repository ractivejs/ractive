(function ( doc ) {

	// Shims for older browsers

	if ( !Date.now ) {
		Date.now = function () { return +new Date(); };
	}

	if ( doc && !doc.createElementNS ) {
		doc.createElementNS = function ( ns, type ) {
			if ( ns && ns !== 'http://www.w3.org/1999/xhtml' ) {
				throw 'This browser does not support namespaces other than http://www.w3.org/1999/xhtml';
			}

			return doc.createElement( type );
		};
	}

	if ( !String.prototype.trim ) {
		String.prototype.trim = function () {
			return this.replace(/^\s+/, '').replace(/\s+$/, '');
		};
	}

	
	// Array extras
	if ( !Array.prototype.indexOf ) {
		Array.prototype.indexOf = function ( needle, i ) {
			var len;

			if ( i === undefined ) {
				i = 0;
			}

			if ( i < 0 ) {
				i+= this.length;
			}

			if ( i < 0 ) {
				i = 0;
			}

			for ( len = this.length; i<len; i++ ) {
				if ( this.hasOwnProperty( i ) && this[i] === needle ) {
					return i;
				}
			}

			return -1;
		};
	}

	if ( !Array.prototype.forEach ) {
		Array.prototype.forEach = function ( callback, context ) {
			var i, len;

			for ( i=0, len=this.length; i<len; i+=1 ) {
				if ( this.hasOwnProperty( i ) ) {
					callback.call( context, this[i], i, this );
				}
			}
		};
	}

	if ( !Array.prototype.map ) {
		Array.prototype.map = function ( mapper, context ) {
			var i, len, mapped = [];

			for ( i=0, len=this.length; i<len; i+=1 ) {
				if ( this.hasOwnProperty( i ) ) {
					mapped[i] = mapper.call( context, this[i], i, this );
				}
			}

			return mapped;
		};
	}

	if ( !Array.prototype.filter ) {
		Array.prototype.filter = function ( filter, context ) {
			var i, len, filtered = [];

			for ( i=0, len=this.length; i<len; i+=1 ) {
				if ( this.hasOwnProperty( i ) && filter.call( context, this[i], i, this ) ) {
					filtered[ filtered.length ] = this[i];
				}
			}

			return filtered;
		};
	}

	// https://gist.github.com/jonathantneal/2869388
	// addEventListener polyfill IE6+
	!window.addEventListener && (function (window, document) {
		function Event(e, element) {
			var instance = this;

			for (property in e) {
				instance[property] = e[property];
			}

			instance.currentTarget =  element;
			instance.target = e.srcElement || element;
			instance.timeStamp = +new Date;

			instance.preventDefault = function () {
				e.returnValue = false;
			};
			instance.stopPropagation = function () {
				e.cancelBubble = true;
			};
		}

		function addEventListener(type, listener) {
			var
			element = this,
			listeners = element.listeners = element.listeners || [],
			index = listeners.push([listener, function (e) {
				listener.call(element, new Event(e, element));
			}]) - 1;

			element.attachEvent('on' + type, listeners[index][1]);
		}

		function removeEventListener(type, listener) {
			for (var element = this, listeners = element.listeners || [], length = listeners.length, index = 0; index < length; ++index) {
				if (listeners[index][0] === listener) {
					element.detachEvent('on' + type, listeners[index][1]);
				}
			}
		}

		window.addEventListener = document.addEventListener = addEventListener;
		window.removeEventListener = document.removeEventListener = removeEventListener;

		if ('Element' in window) {
			Element.prototype.addEventListener    = addEventListener;
			Element.prototype.removeEventListener = removeEventListener;
		} else {
			var
			head = document.getElementsByTagName('head')[0],
			style = document.createElement('style');

			head.insertBefore(style, head.firstChild);

			style.styleSheet.cssText = '*{-ms-event-prototype:expression(!this.addEventListener&&(this.addEventListener=addEventListener)&&(this.removeEventListener=removeEventListener))}';
		}
	})(window, document) && scrollBy(0, 0);

}( document ));
