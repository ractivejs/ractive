import { win, doc } from './config/environment';
import noop from './utils/noop';
import { defineProperty, defineProperties } from './utils/object';

let exportedShims;

if ( !win ) {
	exportedShims = null;
} else {
	exportedShims = {};

	// Shims for older browsers

	if ( !Date.now ) {
		Date.now = function () { return +new Date(); };
	}

	if ( !String.prototype.trim ) {
		String.prototype.trim = function () {
			return this.replace(/^\s+/, '').replace(/\s+$/, '');
		};
	}

	// Polyfill for Object.create
	if ( !Object.create ) {
		Object.create = (function () {
			const Temp = function () {};
			return function ( prototype, properties ) {
				if ( typeof prototype !== 'object' ) {
					throw new TypeError( 'Prototype must be an object' );
				}
				Temp.prototype = prototype;
				const result = new Temp();
				defineProperties( result, properties );
				Temp.prototype = null;
				return result;
			};
		})();
	}

	// Polyfill Object.defineProperty
	if ( !Object.defineProperty ) {
		Object.defineProperty = defineProperty;
	}

	if ( !Object.freeze ) {
		Object.freeze = function () { 'LOL'; };
	}

	// Polyfill for Object.keys
	// https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Object/keys
	if ( !Object.keys ) {
		Object.keys = (function () {
			let hasOwnProperty = Object.prototype.hasOwnProperty,
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

				const result = [];

				for ( const prop in obj ) {
					if ( hasOwnProperty.call( obj, prop ) ){
						result.push( prop );
					}
				}

				if ( hasDontEnumBug ) {
					for ( let i=0; i < dontEnumsLength; i++ ) {
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
			let len;

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
			let i, len;

			for ( i=0, len=this.length; i<len; i+=1 ) {
				if ( this.hasOwnProperty( i ) ) {
					callback.call( context, this[i], i, this );
				}
			}
		};
	}

	if ( !Array.prototype.map ) {
		Array.prototype.map = function ( mapper, context ) {
			let array = this, i, len, mapped = [], isActuallyString;

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
			let i, value, len, valueIsSet;

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
			let i, len, filtered = [];

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
			let t, len, i;

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

	if ( typeof Function.prototype.bind !== 'function' ) {
		Function.prototype.bind = function ( context ) {
			let args, fn, Empty, bound, slice = [].slice;

			if ( typeof this !== 'function' ) {
				throw new TypeError( 'Function.prototype.bind called on non-function' );
			}

			args = slice.call( arguments, 1 );
			fn = this;
			Empty = function () {};

			bound = function () {
				const ctx = this instanceof Empty && context ? this : context;
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
			let Event, addEventListener, removeEventListener, head, style, origCreateElement;

			// because sometimes inquiring minds want to know
			win.appearsToBeIELessEqual8 = true;

			Event = function ( e, element ) {
				let property, instance = this;

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
				let element = this, listeners, i;

				listeners = element.listeners || ( element.listeners = [] );
				i = listeners.length;

				listeners[i] = [ listener, function (e) {
					listener.call( element, new Event( e, element ) );
				}];

				element.attachEvent( 'on' + type, listeners[i][1] );
			};

			removeEventListener = function ( type, listener ) {
				let element = this, listeners, i;

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
					const el = origCreateElement( tagName );
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
			const borderSizes = {};

			function getPixelSize ( element, style, property, fontSize ) {
				const sizeWithSuffix = style[property];
				let size = parseFloat(sizeWithSuffix);
				let suffix = sizeWithSuffix.split(/\d/)[0];

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
				const rootSize = property == 'fontSize' ? fontSize : /width/i.test(property) ? element.clientWidth : element.clientHeight;

				return (suffix == 'em') ? size * fontSize : (suffix == 'in') ? size * 96 : (suffix == 'pt') ? size * 96 / 72 : (suffix == '%') ? size / 100 * rootSize : size;
			}

			function getBorderPixelSize ( size ) {
				let div, bcr;

				// `thin`, `medium` and `thick` vary between browsers. (Don't ever use them.)
				if ( !borderSizes[ size ] ) {
					div = doc.createElement( 'div' );
					div.style.display = 'block';
					div.style.position = 'fixed';
					div.style.width = div.style.height = '0';
					div.style.borderRight = size + ' solid black';

					doc.getElementsByTagName( 'body' )[0].appendChild( div );
					bcr = div.getBoundingClientRect();

					borderSizes[ size ] = bcr.right - bcr.left;
				}

				return borderSizes[ size ];
			}

			function setShortStyleProperty(style, property) {
				const borderSuffix = property == 'border' ? 'Width' : '';
				const t = `${property}Top${borderSuffix}`;
				const r = `${property}Right${borderSuffix}`;
				const b = `${property}Bottom${borderSuffix}`;
				const l = `${property}Left${borderSuffix}`;

				style[property] = (style[t] == style[r] == style[b] == style[l] ? [style[t]]
				: style[t] == style[b] && style[l] == style[r] ? [style[t], style[r]]
				: style[l] == style[r] ? [style[t], style[r], style[b]]
				: [style[t], style[r], style[b], style[l]]).join(' ');
			}

			const normalProps = {
				fontWeight: 400,
				lineHeight: 1.2, // actually varies depending on font-family, but is generally close enough...
				letterSpacing: 0
			};

			function CSSStyleDeclaration(element) {
				let currentStyle, style, fontSize, property;

				currentStyle = element.currentStyle;
				style = this;
				fontSize = getPixelSize(element, currentStyle, 'fontSize', null);

				// TODO tidy this up, test it, send PR to jonathantneal!
				for (property in currentStyle) {
					if ( currentStyle[property] === 'normal' && normalProps.hasOwnProperty( property ) ) {
						style[ property ] = normalProps[ property ];
					} else if ( /width|height|margin.|padding.|border.+W/.test(property) ) {
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
				getPropertyPriority: noop,
				getPropertyValue ( prop ) {
					return this[prop] || '';
				},
				item: noop,
				removeProperty: noop,
				setProperty: noop,
				getPropertyCSSValue: noop
			};

			function getComputedStyle(element) {
				return new CSSStyleDeclaration(element);
			}

			return getComputedStyle;
		}());
	}
}

export default exportedShims;
