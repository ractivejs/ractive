var win, doc, exportedShims;

if ( typeof window === 'undefined' ) {
	exportedShims = null;
} else {
	win = window;
	doc = win.document;
	exportedShims = {};

	if ( !doc ) {
		exportedShims = null;
	}

	// Shims for older browsers

	if ( !Date.now ) {
		Date.now = function () { return +new Date(); };
	}

	if ( !String.prototype.trim ) {
		String.prototype.trim = function () {
			return this.replace(/^\s+/, '').replace(/\s+$/, '');
		};
	}

	// Polyfill for Object.keys
	// https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/keys
	if ( !Object.keys ) {
		Object.keys = (function () {
			var hasOwnProperty = Object.prototype.hasOwnProperty,
				hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
				dontEnums = [
					'toString',
					'toLocaleString',
					'valueOf',
					'hasOwnProperty',
					'isPrototypeOf',
					'propertyIsEnumerable',
					'constructor'
				],
				dontEnumsLength = dontEnums.length;

			return function ( obj ) {
				if ( typeof obj !== 'object' && typeof obj !== 'function' || obj === null ) {
					throw new TypeError( 'Object.keys called on non-object' );
				}

				var result = [];

				for ( var prop in obj ) {
					if ( hasOwnProperty.call( obj, prop ) ){
						result.push( prop );
					}
				}

				if ( hasDontEnumBug ) {
					for ( var i=0; i < dontEnumsLength; i++ ) {
						if ( hasOwnProperty.call( obj, dontEnums[i] ) ){
							result.push( dontEnums[i] );
						}
					}
				}
				return result;
			};
		}());
	}

	// TODO: use defineProperty to make these non-enumerable

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
			var array = this, i, len, mapped = [], isActuallyString;

			// incredibly, if you do something like
			// Array.prototype.map.call( someString, iterator )
			// then `this` will become an instance of String in IE8.
			// And in IE8, you then can't do string[i]. Facepalm.
			if ( array instanceof String ) {
				array = array.toString();
				isActuallyString = true;
			}

			for ( i=0, len=array.length; i<len; i+=1 ) {
				if ( array.hasOwnProperty( i ) || isActuallyString ) {
					mapped[i] = mapper.call( context, array[i], i, array );
				}
			}

			return mapped;
		};
	}

	if ( typeof Array.prototype.reduce !== 'function' ) {
		Array.prototype.reduce = function(callback, opt_initialValue){
			var i, value, len, valueIsSet;

			if ('function' !== typeof callback) {
				throw new TypeError(callback + ' is not a function');
			}

			len = this.length;
			valueIsSet = false;

			if ( arguments.length > 1 ) {
				value = opt_initialValue;
				valueIsSet = true;
			}

			for ( i = 0; i < len; i += 1) {
				if ( this.hasOwnProperty( i ) ) {
					if ( valueIsSet ) {
						value = callback(value, this[i], i, this);
					}
				} else {
					value = this[i];
					valueIsSet = true;
				}
			}

			if ( !valueIsSet ) {
				throw new TypeError( 'Reduce of empty array with no initial value' );
			}

			return value;
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

	if ( !Array.prototype.every ) {
		Array.prototype.every = function ( iterator, context ) {
			var t, len, i;

			if ( this == null ) {
				throw new TypeError();
			}

			t = Object( this );
			len = t.length >>> 0;

			if ( typeof iterator !== 'function' ) {
				throw new TypeError();
			}

			for ( i = 0; i < len; i += 1 ) {
				if ( i in t && !iterator.call( context, t[i], i, t) ) {
					return false;
				}
			}

			return true;
		};
	}

	/*
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
	if (!Array.prototype.find) {
		Array.prototype.find = function(predicate) {
			if (this == null) {
			throw new TypeError('Array.prototype.find called on null or undefined');
			}
			if (typeof predicate !== 'function') {
			throw new TypeError('predicate must be a function');
			}
			var list = Object(this);
			var length = list.length >>> 0;
			var thisArg = arguments[1];
			var value;

			for (var i = 0; i < length; i++) {
				if (i in list) {
					value = list[i];
					if (predicate.call(thisArg, value, i, list)) {
					return value;
					}
				}
			}
			return undefined;
		}
	}
	*/

	if ( typeof Function.prototype.bind !== 'function' ) {
		Function.prototype.bind = function ( context ) {
			var args, fn, Empty, bound, slice = [].slice;

			if ( typeof this !== 'function' ) {
				throw new TypeError( 'Function.prototype.bind called on non-function' );
			}

			args = slice.call( arguments, 1 );
			fn = this;
			Empty = function () {};

			bound = function () {
				var ctx = this instanceof Empty && context ? this : context;
				return fn.apply( ctx, args.concat( slice.call( arguments ) ) );
			};

			Empty.prototype = this.prototype;
			bound.prototype = new Empty();

			return bound;
		};
	}

	// https://gist.github.com/Rich-Harris/6010282 via https://gist.github.com/jonathantneal/2869388
	// addEventListener polyfill IE6+
	if ( !win.addEventListener ) {
		((function(win, doc) {
			var Event, addEventListener, removeEventListener, head, style, origCreateElement;

			Event = function ( e, element ) {
				var property, instance = this;

				for ( property in e ) {
					instance[ property ] = e[ property ];
				}

				instance.currentTarget =  element;
				instance.target = e.srcElement || element;
				instance.timeStamp = +new Date();

				instance.preventDefault = function () {
					e.returnValue = false;
				};

				instance.stopPropagation = function () {
					e.cancelBubble = true;
				};
			};

			addEventListener = function ( type, listener ) {
				var element = this, listeners, i;

				listeners = element.listeners || ( element.listeners = [] );
				i = listeners.length;

				listeners[i] = [ listener, function (e) {
					listener.call( element, new Event( e, element ) );
				}];

				element.attachEvent( 'on' + type, listeners[i][1] );
			};

			removeEventListener = function ( type, listener ) {
				var element = this, listeners, i;

				if ( !element.listeners ) {
					return;
				}

				listeners = element.listeners;
				i = listeners.length;

				while ( i-- ) {
					if (listeners[i][0] === listener) {
						element.detachEvent( 'on' + type, listeners[i][1] );
					}
				}
			};

			win.addEventListener = doc.addEventListener = addEventListener;
			win.removeEventListener = doc.removeEventListener = removeEventListener;

			if ( 'Element' in win ) {
				win.Element.prototype.addEventListener = addEventListener;
				win.Element.prototype.removeEventListener = removeEventListener;
			} else {
				// First, intercept any calls to document.createElement - this is necessary
				// because the CSS hack (see below) doesn't come into play until after a
				// node is added to the DOM, which is too late for a lot of Ractive setup work
				origCreateElement = doc.createElement;

				doc.createElement = function ( tagName ) {
					var el = origCreateElement( tagName );
					el.addEventListener = addEventListener;
					el.removeEventListener = removeEventListener;
					return el;
				};

				// Then, mop up any additional elements that weren't created via
				// document.createElement (i.e. with innerHTML).
				head = doc.getElementsByTagName('head')[0];
				style = doc.createElement('style');

				head.insertBefore( style, head.firstChild );

				//style.styleSheet.cssText = '*{-ms-event-prototype:expression(!this.addEventListener&&(this.addEventListener=addEventListener)&&(this.removeEventListener=removeEventListener))}';
			}
		})( win, doc ));
	}

	// The getComputedStyle polyfill interacts badly with jQuery, so we don't attach
	// it to window. Instead, we export it for other modules to use as needed

	// https://github.com/jonathantneal/Polyfills-for-IE8/blob/master/getComputedStyle.js
	if ( !win.getComputedStyle ) {
		exportedShims.getComputedStyle = (function () {
			var borderSizes = {};

			function getPixelSize(element, style, property, fontSize) {
				var
				sizeWithSuffix = style[property],
				size = parseFloat(sizeWithSuffix),
				suffix = sizeWithSuffix.split(/\d/)[0],
				rootSize;

				if ( isNaN( size ) ) {
					if ( /^thin|medium|thick$/.test( sizeWithSuffix ) ) {
						size = getBorderPixelSize( sizeWithSuffix );
						suffix = '';
					}

					else {
						// TODO...
					}
				}

				fontSize = fontSize != null ? fontSize : /%|em/.test(suffix) && element.parentElement ? getPixelSize(element.parentElement, element.parentElement.currentStyle, 'fontSize', null) : 16;
				rootSize = property == 'fontSize' ? fontSize : /width/i.test(property) ? element.clientWidth : element.clientHeight;

				return (suffix == 'em') ? size * fontSize : (suffix == 'in') ? size * 96 : (suffix == 'pt') ? size * 96 / 72 : (suffix == '%') ? size / 100 * rootSize : size;
			}

			function getBorderPixelSize ( size ) {
				var div, bcr;

				// `thin`, `medium` and `thick` vary between browsers. (Don't ever use them.)
				if ( !borderSizes[ size ] ) {
					div = document.createElement( 'div' );
					div.style.display = 'block';
					div.style.position = 'fixed';
					div.style.width = div.style.height = '0';
					div.style.borderRight = size + ' solid black';

					document.getElementsByTagName( 'body' )[0].appendChild( div );
					bcr = div.getBoundingClientRect();

					borderSizes[ size ] = bcr.right - bcr.left;
				}

				return borderSizes[ size ];
			}

			function setShortStyleProperty(style, property) {
				var
				borderSuffix = property == 'border' ? 'Width' : '',
				t = property + 'Top' + borderSuffix,
				r = property + 'Right' + borderSuffix,
				b = property + 'Bottom' + borderSuffix,
				l = property + 'Left' + borderSuffix;

				style[property] = (style[t] == style[r] == style[b] == style[l] ? [style[t]]
				: style[t] == style[b] && style[l] == style[r] ? [style[t], style[r]]
				: style[l] == style[r] ? [style[t], style[r], style[b]]
				: [style[t], style[r], style[b], style[l]]).join(' ');
			}

			function CSSStyleDeclaration(element) {
				var currentStyle, style, fontSize, property;

				currentStyle = element.currentStyle;
				style = this;
				fontSize = getPixelSize(element, currentStyle, 'fontSize', null);

				// TODO tidy this up, test it, send PR to jonathantneal!
				for (property in currentStyle) {
					if ( /width|height|margin.|padding.|border.+W/.test(property) ) {
						if ( currentStyle[ property ] === 'auto' ) {
							if ( /^width|height/.test( property ) ) {
								// just use clientWidth/clientHeight...
								style[ property ] = ( property === 'width' ? element.clientWidth : element.clientHeight ) + 'px';
							}

							else if ( /(?:padding)?Top|Bottom$/.test( property ) ) {
								style[ property ] = '0px';
							}
						}

						else {
							style[ property ] = getPixelSize(element, currentStyle, property, fontSize) + 'px';
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
			}

			CSSStyleDeclaration.prototype = {
				constructor: CSSStyleDeclaration,
				getPropertyPriority: function () {},
				getPropertyValue: function ( prop ) {
					return this[prop] || '';
				},
				item: function () {},
				removeProperty: function () {},
				setProperty: function () {},
				getPropertyCSSValue: function () {}
			};

			function getComputedStyle(element) {
				return new CSSStyleDeclaration(element);
			}

			return getComputedStyle;
		}());
	}
}

export default exportedShims;
