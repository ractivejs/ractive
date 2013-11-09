/*
	
	Ractive - v0.3.8-pre - 2013-11-09
	==============================================================

	Next-generation DOM manipulation - http://ractivejs.org
	Follow @RactiveJS for updates

	--------------------------------------------------------------

	Copyright 2013 2013 Rich Harris and contributors

	Permission is hereby granted, free of charge, to any person
	obtaining a copy of this software and associated documentation
	files (the "Software"), to deal in the Software without
	restriction, including without limitation the rights to use,
	copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the
	Software is furnished to do so, subject to the following
	conditions:

	The above copyright notice and this permission notice shall be
	included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
	OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
	NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
	HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
	WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
	FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
	OTHER DEALINGS IN THE SOFTWARE.

*/

(function ( win ) {

	'use strict';

	var doc = win.document;

	if ( !doc ) {
		return;
	}

	// Shims for older browsers

	if ( !Date.now ) {
		Date.now = function () { return +new Date(); };
	}

	if ( !doc.createElementNS ) {
		doc.createElementNS = function ( ns, type ) {
			if ( ns && ns !== 'http://www.w3.org/1999/xhtml' ) {
				// TODO update URL when repo changes owner
				throw 'This browser does not support namespaces other than http://www.w3.org/1999/xhtml. The most likely cause of this error is that you\'re trying to render SVG in an older browser. See https://github.com/Rich-Harris/Ractive/wiki/SVG-and-older-browsers for more information';
			}

			return doc.createElement( type );
		};
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



	// https://gist.github.com/Rich-Harris/6010282 via https://gist.github.com/jonathantneal/2869388
	// addEventListener polyfill IE6+
	if ( !win.addEventListener ) {
		(function ( win, doc ) {
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
				Element.prototype.addEventListener = addEventListener;
				Element.prototype.removeEventListener = removeEventListener;
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
		}( win, doc ));
	}


	// https://github.com/jonathantneal/Polyfills-for-IE8/blob/master/getComputedStyle.js
	if ( !win.getComputedStyle ) {
		win.getComputedStyle = (function () {
			function getPixelSize(element, style, property, fontSize) {
				var
				sizeWithSuffix = style[property],
				size = parseFloat(sizeWithSuffix),
				suffix = sizeWithSuffix.split(/\d/)[0],
				rootSize;

				fontSize = fontSize != null ? fontSize : /%|em/.test(suffix) && element.parentElement ? getPixelSize(element.parentElement, element.parentElement.currentStyle, 'fontSize', null) : 16;
				rootSize = property == 'fontSize' ? fontSize : /width/i.test(property) ? element.clientWidth : element.clientHeight;

				return (suffix == 'em') ? size * fontSize : (suffix == 'in') ? size * 96 : (suffix == 'pt') ? size * 96 / 72 : (suffix == '%') ? size / 100 * rootSize : size;
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

				for (property in currentStyle) {
					if (/width|height|margin.|padding.|border.+W/.test(property) && style[property] !== 'auto') {
						style[property] = getPixelSize(element, currentStyle, property, fontSize) + 'px';
					} else if (property === 'styleFloat') {
						style['float'] = currentStyle[property];
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

}( typeof window !== 'undefined' ? window : this ));

(function ( global ) {

// Some of the modules herein have circular dependencies. This isn't a
// huge problem with AMD, because you can do
//
//     require([ 'some/circular/dependency' ], function ( dep ) {
//       dependency = dep;
//     });
//
// However we're using amdclean to get rid of define() and require()
// calls in the distributed file, and circular dependencies break
// amdclean. So we're collecting those require calls (which amdclean
// rewrites) and executing them at the end, once modules have been defined.
var loadCircularDependency = function ( callback ) {
	loadCircularDependency.callbacks.push( callback );
};

loadCircularDependency.callbacks = [];

// Internet Explorer derp. Methods that should be attached to Node.prototype
// are instead attached to HTMLElement.prototype, which means SVG elements
// can't use them. Remember kids, friends don't let friends use IE.
// 
// This is here, rather than in legacy.js, because it affects IE9.
if ( global.Node && !global.Node.prototype.contains && global.HTMLElement && global.HTMLElement.prototype.contains ) {
	global.Node.prototype.contains = global.HTMLElement.prototype.contains;
}
var utils_create = function () {
        
        var create;
        try {
            Object.create(null);
            create = Object.create;
        } catch (err) {
            create = function () {
                var F = function () {
                };
                return function (proto, props) {
                    var obj;
                    if (proto === null) {
                        return {};
                    }
                    F.prototype = proto;
                    obj = new F();
                    if (props) {
                        Object.defineProperties(obj, props);
                    }
                    return obj;
                };
            }();
        }
        return create;
    }();
var config_isClient = function () {
        
        if (typeof document === 'object') {
            return true;
        }
        return false;
    }();
var utils_defineProperty = function (isClient) {
        
        try {
            Object.defineProperty({}, 'test', { value: 0 });
            if (isClient) {
                Object.defineProperty(document.createElement('div'), 'test', { value: 0 });
            }
            return Object.defineProperty;
        } catch (err) {
            return function (obj, prop, desc) {
                obj[prop] = desc.value;
            };
        }
    }(config_isClient);
var utils_defineProperties = function (defineProperty, isClient) {
        
        try {
            try {
                Object.defineProperties({}, { test: { value: 0 } });
            } catch (err) {
                throw err;
            }
            if (isClient) {
                Object.defineProperties(document.createElement('div'), { test: { value: 0 } });
            }
            return Object.defineProperties;
        } catch (err) {
            return function (obj, props) {
                var prop;
                for (prop in props) {
                    if (props.hasOwnProperty(prop)) {
                        defineProperty(obj, prop, props[prop]);
                    }
                }
            };
        }
    }(utils_defineProperty, config_isClient);
var utils_normaliseKeypath = function () {
        
        var pattern = /\[\s*([0-9]|[1-9][0-9]+)\s*\]/g;
        return function (keypath) {
            return keypath.replace(pattern, '.$1');
        };
    }();
var registries_adaptors = {};
var config_types = {
        TEXT: 1,
        INTERPOLATOR: 2,
        TRIPLE: 3,
        SECTION: 4,
        INVERTED: 5,
        CLOSING: 6,
        ELEMENT: 7,
        PARTIAL: 8,
        COMMENT: 9,
        DELIMCHANGE: 10,
        MUSTACHE: 11,
        TAG: 12,
        COMPONENT: 15,
        NUMBER_LITERAL: 20,
        STRING_LITERAL: 21,
        ARRAY_LITERAL: 22,
        OBJECT_LITERAL: 23,
        BOOLEAN_LITERAL: 24,
        GLOBAL: 26,
        KEY_VALUE_PAIR: 27,
        REFERENCE: 30,
        REFINEMENT: 31,
        MEMBER: 32,
        PREFIX_OPERATOR: 33,
        BRACKETED: 34,
        CONDITIONAL: 35,
        INFIX_OPERATOR: 36,
        INVOCATION: 40
    };
var utils_isArray = function () {
        
        var toString = Object.prototype.toString;
        return function (thing) {
            return toString.call(thing) === '[object Array]';
        };
    }();
var shared_clearCache = function () {
        
        return function clearCache(ractive, keypath) {
            var cacheMap, wrappedProperty;
            if (wrappedProperty = ractive._wrapped[keypath]) {
                if (wrappedProperty.teardown() !== false) {
                    ractive._wrapped[keypath] = null;
                }
            }
            ractive._cache[keypath] = undefined;
            if (cacheMap = ractive._cacheMap[keypath]) {
                while (cacheMap.length) {
                    clearCache(ractive, cacheMap.pop());
                }
            }
        };
    }();
var shared_getValueFromCheckboxes = function () {
        
        return function (ractive, keypath) {
            var value, checkboxes, checkbox, len, i, rootEl;
            value = [];
            rootEl = ractive.rendered ? ractive.el : ractive.fragment.docFrag;
            checkboxes = rootEl.querySelectorAll('input[type="checkbox"][name="{{' + keypath + '}}"]');
            len = checkboxes.length;
            for (i = 0; i < len; i += 1) {
                checkbox = checkboxes[i];
                if (checkbox.hasAttribute('checked') || checkbox.checked) {
                    value[value.length] = checkbox._ractive.value;
                }
            }
            return value;
        };
    }();
var shared_processDeferredUpdates = function (getValueFromCheckboxes) {
        
        return function (ractive, initialRender) {
            var evaluator, attribute, keypath;
            while (ractive._defEvals.length) {
                evaluator = ractive._defEvals.pop();
                evaluator.update().deferred = false;
            }
            while (ractive._defAttrs.length) {
                attribute = ractive._defAttrs.pop();
                attribute.update().deferred = false;
            }
            while (ractive._defSelectValues.length) {
                ractive._defSelectValues.pop().deferredUpdate();
            }
            while (ractive._defCheckboxes.length) {
                keypath = ractive._defCheckboxes.pop();
                ractive.set(keypath, getValueFromCheckboxes(ractive, keypath));
            }
            while (ractive._defRadios.length) {
                ractive._defRadios.pop().update();
            }
            while (ractive._defObservers.length) {
                ractive._defObservers.pop().update(true);
            }
            if (!initialRender) {
                while (ractive._defTransitions.length) {
                    ractive._defTransitions.pop().init();
                }
            }
        };
    }(shared_getValueFromCheckboxes);
var shared_makeTransitionManager = function () {
        
        var makeTransitionManager = function (root, callback) {
            var transitionManager, nodesToDetach, detachNodes, nodeHasNoTransitioningChildren;
            nodesToDetach = [];
            detachNodes = function () {
                var i, node;
                i = nodesToDetach.length;
                while (i--) {
                    node = nodesToDetach[i];
                    if (nodeHasNoTransitioningChildren(node)) {
                        node.parentNode.removeChild(node);
                        nodesToDetach.splice(i, 1);
                    }
                }
            };
            nodeHasNoTransitioningChildren = function (node) {
                var i, candidate;
                i = transitionManager.active.length;
                while (i--) {
                    candidate = transitionManager.active[i];
                    if (node.contains(candidate)) {
                        return false;
                    }
                }
                return true;
            };
            transitionManager = {
                active: [],
                push: function (node) {
                    transitionManager.active[transitionManager.active.length] = node;
                },
                pop: function (node) {
                    var index;
                    index = transitionManager.active.indexOf(node);
                    if (index === -1) {
                        return;
                    }
                    transitionManager.active.splice(index, 1);
                    detachNodes();
                    if (!transitionManager.active.length && transitionManager._ready) {
                        transitionManager.complete();
                    }
                },
                complete: function () {
                    if (callback) {
                        callback.call(root);
                    }
                },
                ready: function () {
                    detachNodes();
                    transitionManager._ready = true;
                    if (!transitionManager.active.length) {
                        transitionManager.complete();
                    }
                },
                detachWhenReady: function (node) {
                    nodesToDetach[nodesToDetach.length] = node;
                }
            };
            return transitionManager;
        };
        return makeTransitionManager;
    }();
var shared_notifyDependants = function () {
        
        var notifyDependants = function (ractive, keypath, onlyDirect) {
            var i;
            for (i = 0; i < ractive._deps.length; i += 1) {
                notifyDependantsAtPriority(ractive, keypath, i, onlyDirect);
            }
        };
        notifyDependants.multiple = function (ractive, keypaths, onlyDirect) {
            var i, j, len;
            len = keypaths.length;
            for (i = 0; i < ractive._deps.length; i += 1) {
                if (ractive._deps[i]) {
                    j = len;
                    while (j--) {
                        notifyDependantsAtPriority(ractive, keypaths[j], i, onlyDirect);
                    }
                }
            }
        };
        return notifyDependants;
        function notifyDependantsAtPriority(ractive, keypath, priority, onlyDirect) {
            var depsByKeypath, deps, i, childDeps;
            depsByKeypath = ractive._deps[priority];
            if (!depsByKeypath) {
                return;
            }
            deps = depsByKeypath[keypath];
            if (deps) {
                i = deps.length;
                while (i--) {
                    deps[i].update();
                }
            }
            if (onlyDirect) {
                return;
            }
            childDeps = ractive._depsMap[keypath];
            if (childDeps) {
                i = childDeps.length;
                while (i--) {
                    notifyDependantsAtPriority(ractive, childDeps[i], priority);
                }
            }
        }
    }();
var get_arrayAdaptor = function (types, defineProperty, isArray, clearCache, processDeferredUpdates, makeTransitionManager, notifyDependants) {
        
        var arrayAdaptor, notifyArrayDependants, ArrayWrapper, patchArrayMethods, unpatchArrayMethods, patchedArrayProto, testObj, mutatorMethods, noop, errorMessage;
        arrayAdaptor = {
            filter: function (ractive, object, keypath) {
                return keypath.charAt(0) !== '(' && isArray(object) && (!object._ractive || !object._ractive.setting);
            },
            wrap: function (ractive, array, keypath) {
                return new ArrayWrapper(ractive, array, keypath);
            }
        };
        ArrayWrapper = function (ractive, array, keypath) {
            this.root = ractive;
            this.value = array;
            this.keypath = keypath;
            if (!array._ractive) {
                defineProperty(array, '_ractive', {
                    value: {
                        wrappers: [],
                        instances: [],
                        setting: false
                    },
                    configurable: true
                });
                patchArrayMethods(array);
            }
            if (!array._ractive.instances[ractive._guid]) {
                array._ractive.instances[ractive._guid] = 0;
                array._ractive.instances.push(ractive);
            }
            array._ractive.instances[ractive._guid] += 1;
            array._ractive.wrappers.push(this);
        };
        ArrayWrapper.prototype = {
            get: function () {
                return this.value;
            },
            teardown: function () {
                var array, storage, wrappers, instances, index;
                array = this.value;
                storage = array._ractive;
                wrappers = storage.wrappers;
                instances = storage.instances;
                if (storage.setting) {
                    return false;
                }
                index = wrappers.indexOf(this);
                if (index === -1) {
                    throw new Error(errorMessage);
                }
                wrappers.splice(index, 1);
                if (!wrappers.length) {
                    delete array._ractive;
                    unpatchArrayMethods(this.value);
                } else {
                    instances[this.root._guid] -= 1;
                    if (!instances[this.root._guid]) {
                        index = instances.indexOf(this.root);
                        if (index === -1) {
                            throw new Error(errorMessage);
                        }
                        instances.splice(index, 1);
                    }
                }
            }
        };
        notifyArrayDependants = function (array, methodName, args) {
            var notifyKeypathDependants, queueDependants, wrappers, wrapper, i;
            notifyKeypathDependants = function (root, keypath) {
                var depsByKeypath, deps, keys, upstreamQueue, smartUpdateQueue, dumbUpdateQueue, i, changed, start, end, childKeypath, lengthUnchanged;
                if (methodName === 'sort' || methodName === 'reverse') {
                    root.set(keypath, array);
                    return;
                }
                clearCache(root, keypath);
                smartUpdateQueue = [];
                dumbUpdateQueue = [];
                for (i = 0; i < root._deps.length; i += 1) {
                    depsByKeypath = root._deps[i];
                    if (!depsByKeypath) {
                        continue;
                    }
                    deps = depsByKeypath[keypath];
                    if (deps) {
                        queueDependants(root, keypath, deps, smartUpdateQueue, dumbUpdateQueue);
                        processDeferredUpdates(root);
                        while (smartUpdateQueue.length) {
                            smartUpdateQueue.pop().smartUpdate(methodName, args);
                        }
                        while (dumbUpdateQueue.length) {
                            dumbUpdateQueue.pop().update();
                        }
                    }
                }
                if (methodName === 'splice' && args.length > 2 && args[1]) {
                    changed = Math.min(args[1], args.length - 2);
                    start = args[0];
                    end = start + changed;
                    if (args[1] === args.length - 2) {
                        lengthUnchanged = true;
                    }
                    for (i = start; i < end; i += 1) {
                        childKeypath = keypath + '.' + i;
                        notifyDependants(root, childKeypath);
                    }
                }
                processDeferredUpdates(root);
                upstreamQueue = [];
                keys = keypath.split('.');
                while (keys.length) {
                    keys.pop();
                    upstreamQueue[upstreamQueue.length] = keys.join('.');
                }
                notifyDependants.multiple(root, upstreamQueue, true);
                if (!lengthUnchanged) {
                    notifyDependants(root, keypath + '.length', true);
                }
            };
            queueDependants = function (root, keypath, deps, smartUpdateQueue, dumbUpdateQueue) {
                var k, dependant;
                k = deps.length;
                while (k--) {
                    dependant = deps[k];
                    if (dependant.type === types.REFERENCE) {
                        dependant.update();
                    } else if (dependant.keypath === keypath && dependant.type === types.SECTION && dependant.parentNode) {
                        smartUpdateQueue[smartUpdateQueue.length] = dependant;
                    } else {
                        dumbUpdateQueue[dumbUpdateQueue.length] = dependant;
                    }
                }
            };
            wrappers = array._ractive.wrappers;
            i = wrappers.length;
            while (i--) {
                wrapper = wrappers[i];
                notifyKeypathDependants(wrapper.root, wrapper.keypath);
            }
        };
        patchedArrayProto = [];
        mutatorMethods = [
            'pop',
            'push',
            'reverse',
            'shift',
            'sort',
            'splice',
            'unshift'
        ];
        noop = function () {
        };
        mutatorMethods.forEach(function (methodName) {
            var method = function () {
                var result, instances, instance, i, previousTransitionManagers = {}, transitionManagers = {};
                result = Array.prototype[methodName].apply(this, arguments);
                instances = this._ractive.instances;
                i = instances.length;
                while (i--) {
                    instance = instances[i];
                    previousTransitionManagers[instance._guid] = instance._transitionManager;
                    instance._transitionManager = transitionManagers[instance._guid] = makeTransitionManager(instance, noop);
                }
                this._ractive.setting = true;
                notifyArrayDependants(this, methodName, arguments);
                this._ractive.setting = false;
                i = instances.length;
                while (i--) {
                    instance = instances[i];
                    instance._transitionManager = previousTransitionManagers[instance._guid];
                    transitionManagers[instance._guid].ready();
                }
                return result;
            };
            defineProperty(patchedArrayProto, methodName, { value: method });
        });
        testObj = {};
        if (testObj.__proto__) {
            patchArrayMethods = function (array) {
                array.__proto__ = patchedArrayProto;
            };
            unpatchArrayMethods = function (array) {
                array.__proto__ = Array.prototype;
            };
        } else {
            patchArrayMethods = function (array) {
                var i, methodName;
                i = mutatorMethods.length;
                while (i--) {
                    methodName = mutatorMethods[i];
                    defineProperty(array, methodName, {
                        value: patchedArrayProto[methodName],
                        configurable: true
                    });
                }
            };
            unpatchArrayMethods = function (array) {
                var i;
                i = mutatorMethods.length;
                while (i--) {
                    delete array[mutatorMethods[i]];
                }
            };
        }
        errorMessage = 'Something went wrong in a rather interesting way';
        return arrayAdaptor;
    }(config_types, utils_defineProperty, utils_isArray, shared_clearCache, shared_processDeferredUpdates, shared_makeTransitionManager, shared_notifyDependants);
var get_magicAdaptor = function () {
        
        var magicAdaptor, MagicWrapper;
        try {
            Object.defineProperty({}, 'test', { value: 0 });
        } catch (err) {
            return false;
        }
        magicAdaptor = {
            wrap: function (ractive, object, keypath) {
                return new MagicWrapper(ractive, object, keypath);
            }
        };
        MagicWrapper = function (ractive, object, keypath) {
            var wrapper = this, keys, prop, objKeypath, descriptor, wrappers, oldGet, oldSet, get, set;
            this.ractive = ractive;
            this.keypath = keypath;
            keys = keypath.split('.');
            this.prop = keys.pop();
            objKeypath = keys.join('.');
            this.obj = ractive.get(objKeypath);
            descriptor = this.originalDescriptor = Object.getOwnPropertyDescriptor(this.obj, this.prop);
            if (descriptor && descriptor.set && (wrappers = descriptor.set._ractiveWrappers)) {
                if (wrappers.indexOf(this) === -1) {
                    wrappers[wrappers.length] = this;
                }
                return;
            }
            if (descriptor && !descriptor.configurable) {
                throw new Error('Cannot use magic mode with property "' + prop + '" - object is not configurable');
            }
            if (descriptor) {
                this.value = descriptor.value;
                oldGet = descriptor.get;
                oldSet = descriptor.set;
            }
            get = oldGet || function () {
                return wrapper.value;
            };
            set = function (value) {
                var wrappers, wrapper, i;
                if (oldSet) {
                    oldSet(value);
                }
                wrappers = set._ractiveWrappers;
                i = wrappers.length;
                while (i--) {
                    wrapper = wrappers[i];
                    if (!wrapper.resetting) {
                        wrapper.ractive.set(wrapper.keypath, value);
                    }
                }
            };
            set._ractiveWrappers = [this];
            Object.defineProperty(this.obj, this.prop, {
                get: get,
                set: set,
                enumerable: true,
                configurable: true
            });
        };
        MagicWrapper.prototype = {
            get: function () {
                return this.value;
            },
            reset: function (value) {
                this.resetting = true;
                this.value = value;
                this.obj[this.prop] = value;
                this.resetting = false;
            },
            teardown: function () {
                var descriptor, set, value, wrappers;
                descriptor = Object.getOwnPropertyDescriptor(this.obj, this.prop);
                set = descriptor.set;
                wrappers = set._ractiveWrappers;
                wrappers.splice(wrappers.indexOf(this), 1);
                if (!wrappers.length) {
                    value = this.obj[this.prop];
                    Object.defineProperty(this.obj, this.prop, this.originalDescriptor);
                    this.obj[this.prop] = value;
                }
            }
        };
        return magicAdaptor;
    }();
var get__index = function (normaliseKeypath, adaptorRegistry, arrayAdaptor, magicAdaptor) {
        
        var get, _get, retrieve, prefix, getPrefixer, prefixers = {}, adaptIfNecessary;
        get = function (keypath) {
            return _get(this, keypath);
        };
        _get = function (ractive, keypath) {
            var cache, cached, value, wrapped, evaluator;
            keypath = normaliseKeypath(keypath || '');
            cache = ractive._cache;
            if ((cached = cache[keypath]) !== undefined) {
                return cached;
            }
            if (wrapped = ractive._wrapped[keypath]) {
                value = wrapped.value;
            } else if (!keypath) {
                adaptIfNecessary(ractive, '', ractive.data);
                value = ractive.data;
            } else if (evaluator = ractive._evaluators[keypath]) {
                value = evaluator.value;
            } else {
                value = retrieve(ractive, keypath);
            }
            cache[keypath] = value;
            return value;
        };
        retrieve = function (ractive, keypath) {
            var keys, key, parentKeypath, parentValue, cacheMap, value, wrapped;
            keys = keypath.split('.');
            key = keys.pop();
            parentKeypath = keys.join('.');
            parentValue = _get(ractive, parentKeypath);
            if (wrapped = ractive._wrapped[parentKeypath]) {
                parentValue = wrapped.get();
            }
            if (parentValue === null || parentValue === undefined) {
                return;
            }
            if (!(cacheMap = ractive._cacheMap[parentKeypath])) {
                ractive._cacheMap[parentKeypath] = [keypath];
            } else {
                if (cacheMap.indexOf(keypath) === -1) {
                    cacheMap[cacheMap.length] = keypath;
                }
            }
            value = parentValue[key];
            if (adaptIfNecessary(ractive, keypath, value)) {
                return value;
            }
            if (ractive.magic) {
                ractive._wrapped[keypath] = magicAdaptor.wrap(ractive, value, keypath);
            }
            if (ractive.modifyArrays) {
                if (arrayAdaptor.filter(ractive, value, keypath)) {
                    ractive._wrapped[keypath] = arrayAdaptor.wrap(ractive, value, keypath);
                }
            }
            ractive._cache[keypath] = value;
            return value;
        };
        prefix = function (obj, prefix) {
            var prefixed = {}, key;
            if (!prefix) {
                return obj;
            }
            prefix += '.';
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    prefixed[prefix + key] = obj[key];
                }
            }
            return prefixed;
        };
        getPrefixer = function (rootKeypath) {
            var rootDot;
            if (!prefixers[rootKeypath]) {
                rootDot = rootKeypath ? rootKeypath + '.' : '';
                prefixers[rootKeypath] = function (relativeKeypath, value) {
                    var obj;
                    if (typeof relativeKeypath === 'string') {
                        obj = {};
                        obj[rootDot + relativeKeypath] = value;
                        return obj;
                    }
                    if (typeof relativeKeypath === 'object') {
                        return rootDot ? prefix(relativeKeypath, rootKeypath) : relativeKeypath;
                    }
                };
            }
            return prefixers[rootKeypath];
        };
        adaptIfNecessary = function (ractive, keypath, value) {
            var i, adaptor, wrapped;
            i = ractive.adaptors.length;
            while (i--) {
                adaptor = ractive.adaptors[i];
                if (typeof adaptor === 'string') {
                    if (!adaptorRegistry[adaptor]) {
                        throw new Error('Missing adaptor "' + adaptor + '"');
                    }
                    adaptor = ractive.adaptors[i] = adaptorRegistry[adaptor];
                }
                if (adaptor.filter(value, keypath, ractive)) {
                    wrapped = ractive._wrapped[keypath] = adaptor.wrap(ractive, value, keypath, getPrefixer(keypath));
                    ractive._cache[keypath] = value;
                    return true;
                }
            }
        };
        return get;
    }(utils_normaliseKeypath, registries_adaptors, get_arrayAdaptor, get_magicAdaptor);
var utils_isObject = function () {
        
        var toString = Object.prototype.toString;
        return function (thing) {
            return typeof thing === 'object' && toString.call(thing) === '[object Object]';
        };
    }();
var utils_isEqual = function () {
        
        return function (a, b) {
            if (a === null && b === null) {
                return true;
            }
            if (typeof a === 'object' || typeof b === 'object') {
                return false;
            }
            return a === b;
        };
    }();
var shared_resolveRef = function () {
        
        var resolveRef;
        resolveRef = function (ractive, ref, contextStack) {
            var keys, lastKey, contextKeys, innerMostContext, postfix, parentKeypath, parentValue, wrapped, keypath, context, ancestorErrorMessage;
            ancestorErrorMessage = 'Could not resolve reference - too many "../" prefixes';
            if (ref === '.') {
                if (!contextStack.length) {
                    return '';
                }
                return contextStack[contextStack.length - 1];
            }
            if (ref.charAt(0) === '.') {
                context = contextStack[contextStack.length - 1];
                contextKeys = context ? context.split('.') : [];
                if (ref.substr(0, 3) === '../') {
                    while (ref.substr(0, 3) === '../') {
                        if (!contextKeys.length) {
                            throw new Error(ancestorErrorMessage);
                        }
                        contextKeys.pop();
                        ref = ref.substring(3);
                    }
                    contextKeys.push(ref);
                    return contextKeys.join('.');
                }
                if (!context) {
                    return ref.substring(1);
                }
                return context + ref;
            }
            keys = ref.split('.');
            lastKey = keys.pop();
            postfix = keys.length ? '.' + keys.join('.') : '';
            contextStack = contextStack.concat();
            while (contextStack.length) {
                innerMostContext = contextStack.pop();
                parentKeypath = innerMostContext + postfix;
                parentValue = ractive.get(parentKeypath);
                if (wrapped = ractive._wrapped[parentKeypath]) {
                    parentValue = wrapped.get();
                }
                if (typeof parentValue === 'object' && parentValue !== null && parentValue.hasOwnProperty(lastKey)) {
                    keypath = innerMostContext + '.' + ref;
                    break;
                }
            }
            if (!keypath && ractive.get(ref) !== undefined) {
                keypath = ref;
            }
            return keypath;
        };
        return resolveRef;
    }();
var shared_attemptKeypathResolution = function (resolveRef) {
        
        return function (ractive) {
            var i, unresolved, keypath;
            i = ractive._pendingResolution.length;
            while (i--) {
                unresolved = ractive._pendingResolution.splice(i, 1)[0];
                keypath = resolveRef(ractive, unresolved.ref, unresolved.contextStack);
                if (keypath !== undefined) {
                    unresolved.resolve(keypath);
                } else {
                    ractive._pendingResolution[ractive._pendingResolution.length] = unresolved;
                }
            }
        };
    }(shared_resolveRef);
var prototype_set = function (isObject, isEqual, normaliseKeypath, clearCache, notifyDependants, attemptKeypathResolution, makeTransitionManager, processDeferredUpdates) {
        
        var set, updateModel, getUpstreamChanges, resetWrapped;
        set = function (keypath, value, complete) {
            var map, changes, upstreamChanges, previousTransitionManager, transitionManager, i, changeHash;
            changes = [];
            if (isObject(keypath)) {
                map = keypath;
                complete = value;
            }
            if (map) {
                for (keypath in map) {
                    if (map.hasOwnProperty(keypath)) {
                        value = map[keypath];
                        keypath = normaliseKeypath(keypath);
                        updateModel(this, keypath, value, changes);
                    }
                }
            } else {
                keypath = normaliseKeypath(keypath);
                updateModel(this, keypath, value, changes);
            }
            if (!changes.length) {
                return;
            }
            previousTransitionManager = this._transitionManager;
            this._transitionManager = transitionManager = makeTransitionManager(this, complete);
            upstreamChanges = getUpstreamChanges(changes);
            if (upstreamChanges.length) {
                notifyDependants.multiple(this, upstreamChanges, true);
            }
            notifyDependants.multiple(this, changes);
            if (this._pendingResolution.length) {
                attemptKeypathResolution(this);
            }
            processDeferredUpdates(this);
            this._transitionManager = previousTransitionManager;
            transitionManager.ready();
            if (!this.firingChangeEvent) {
                this.firingChangeEvent = true;
                changeHash = {};
                i = changes.length;
                while (i--) {
                    changeHash[changes[i]] = this.get(changes[i]);
                }
                this.fire('change', changeHash);
                this.firingChangeEvent = false;
            }
            return this;
        };
        updateModel = function (ractive, keypath, value, changes) {
            var cached, keys, previous, key, obj, accumulated, currentKeypath, keypathToClear, wrapped;
            if ((wrapped = ractive._wrapped[keypath]) && wrapped.reset) {
                if (resetWrapped(ractive, keypath, value, wrapped, changes) !== false) {
                    return;
                }
            }
            cached = ractive._cache[keypath];
            previous = ractive.get(keypath);
            keys = keypath.split('.');
            accumulated = [];
            if (previous !== value) {
                if (wrapped = ractive._wrapped['']) {
                    if (wrapped.set) {
                        wrapped.set(keys.join('.'), value);
                    }
                    obj = wrapped.get();
                } else {
                    obj = ractive.data;
                }
                while (keys.length > 1) {
                    key = accumulated[accumulated.length] = keys.shift();
                    currentKeypath = accumulated.join('.');
                    if (wrapped = ractive._wrapped[currentKeypath]) {
                        if (wrapped.set) {
                            wrapped.set(keys.join('.'), value);
                        }
                        obj = wrapped.get();
                    } else {
                        if (!obj[key]) {
                            if (!keypathToClear) {
                                keypathToClear = currentKeypath;
                            }
                            obj[key] = /^\s*[0-9]+\s*$/.test(keys[0]) ? [] : {};
                        }
                        obj = obj[key];
                    }
                }
                key = keys[0];
                obj[key] = value;
            } else {
                if (value === cached && typeof value !== 'object') {
                    return;
                }
            }
            clearCache(ractive, keypathToClear || keypath);
            changes[changes.length] = keypath;
        };
        getUpstreamChanges = function (changes) {
            var upstreamChanges = [''], i, keypath, keys, upstreamKeypath;
            i = changes.length;
            while (i--) {
                keypath = changes[i];
                keys = keypath.split('.');
                while (keys.length > 1) {
                    keys.pop();
                    upstreamKeypath = keys.join('.');
                    if (!upstreamChanges[upstreamKeypath]) {
                        upstreamChanges[upstreamChanges.length] = upstreamKeypath;
                        upstreamChanges[upstreamKeypath] = true;
                    }
                }
            }
            return upstreamChanges;
        };
        resetWrapped = function (ractive, keypath, value, wrapped, changes) {
            var previous, cached, cacheMap, i;
            previous = wrapped.get();
            if (!isEqual(previous, value)) {
                if (wrapped.reset(value) === false) {
                    return false;
                }
            }
            value = wrapped.get();
            cached = ractive._cache[keypath];
            if (!isEqual(cached, value)) {
                ractive._cache[keypath] = value;
                cacheMap = ractive._cacheMap[keypath];
                if (cacheMap) {
                    i = cacheMap.length;
                    while (i--) {
                        clearCache(ractive, cacheMap[i]);
                    }
                }
                changes[changes.length] = keypath;
            }
        };
        return set;
    }(utils_isObject, utils_isEqual, utils_normaliseKeypath, shared_clearCache, shared_notifyDependants, shared_attemptKeypathResolution, shared_makeTransitionManager, shared_processDeferredUpdates);
var prototype_update = function (makeTransitionManager, attemptKeypathResolution, clearCache, notifyDependants, processDeferredUpdates) {
        
        return function (keypath, complete) {
            var transitionManager, previousTransitionManager;
            if (typeof keypath === 'function') {
                complete = keypath;
                keypath = '';
            }
            previousTransitionManager = this._transitionManager;
            this._transitionManager = transitionManager = makeTransitionManager(this, complete);
            attemptKeypathResolution(this);
            clearCache(this, keypath || '');
            notifyDependants(this, keypath || '');
            processDeferredUpdates(this);
            this._transitionManager = previousTransitionManager;
            transitionManager.ready();
            if (typeof keypath === 'string') {
                this.fire('update', keypath);
            } else {
                this.fire('update');
            }
            return this;
        };
    }(shared_makeTransitionManager, shared_attemptKeypathResolution, shared_clearCache, shared_notifyDependants, shared_processDeferredUpdates);
var utils_arrayContentsMatch = function (isArray) {
        
        return function (a, b) {
            var i;
            if (!isArray(a) || !isArray(b)) {
                return false;
            }
            if (a.length !== b.length) {
                return false;
            }
            i = a.length;
            while (i--) {
                if (a[i] !== b[i]) {
                    return false;
                }
            }
            return true;
        };
    }(utils_isArray);
var prototype_updateModel = function (getValueFromCheckboxes, arrayContentsMatch, isEqual) {
        
        return function (keypath, cascade) {
            var values, deferredCheckboxes, i;
            if (typeof keypath !== 'string') {
                keypath = '';
                cascade = true;
            }
            consolidateChangedValues(this, keypath, values = {}, deferredCheckboxes = [], cascade);
            if (i = deferredCheckboxes.length) {
                while (i--) {
                    keypath = deferredCheckboxes[i];
                    values[keypath] = getValueFromCheckboxes(this, keypath);
                }
            }
            this.set(values);
        };
        function consolidateChangedValues(ractive, keypath, values, deferredCheckboxes, cascade) {
            var bindings, childDeps, i, binding, oldValue, newValue;
            bindings = ractive._twowayBindings[keypath];
            if (bindings) {
                i = bindings.length;
                while (i--) {
                    binding = bindings[i];
                    if (binding.radioName && !binding.node.checked) {
                        continue;
                    }
                    if (binding.checkboxName) {
                        if (binding.changed() && !deferredCheckboxes[keypath]) {
                            deferredCheckboxes[keypath] = true;
                            deferredCheckboxes[deferredCheckboxes.length] = keypath;
                        }
                        continue;
                    }
                    oldValue = binding.attr.value;
                    newValue = binding.value();
                    if (arrayContentsMatch(oldValue, newValue)) {
                        continue;
                    }
                    if (!isEqual(oldValue, newValue)) {
                        values[keypath] = newValue;
                    }
                }
            }
            if (!cascade) {
                return;
            }
            childDeps = ractive._depsMap[keypath];
            if (childDeps) {
                i = childDeps.length;
                while (i--) {
                    consolidateChangedValues(ractive, childDeps[i], values, deferredCheckboxes, cascade);
                }
            }
        }
    }(shared_getValueFromCheckboxes, utils_arrayContentsMatch, utils_isEqual);
var animate_requestAnimationFrame = function () {
        
        var window = window;
        if (!window) {
            return function () {
            };
        }
        (function (vendors, lastTime, window) {
            var x, setTimeout;
            if (window.requestAnimationFrame) {
                return;
            }
            for (x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
                window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
            }
            if (!window.requestAnimationFrame) {
                setTimeout = window.setTimeout;
                window.requestAnimationFrame = function (callback) {
                    var currTime, timeToCall, id;
                    currTime = Date.now();
                    timeToCall = Math.max(0, 16 - (currTime - lastTime));
                    id = setTimeout(function () {
                        callback(currTime + timeToCall);
                    }, timeToCall);
                    lastTime = currTime + timeToCall;
                    return id;
                };
            }
        }([
            'ms',
            'moz',
            'webkit',
            'o'
        ], 0, window));
        return window.requestAnimationFrame;
    }();
var animate_animationCollection = function (rAF) {
        
        var animationCollection = {
                animations: [],
                tick: function () {
                    var i, animation;
                    for (i = 0; i < this.animations.length; i += 1) {
                        animation = this.animations[i];
                        if (!animation.tick()) {
                            this.animations.splice(i--, 1);
                        }
                    }
                    if (this.animations.length) {
                        rAF(this.boundTick);
                    } else {
                        this.running = false;
                    }
                },
                boundTick: function () {
                    animationCollection.tick();
                },
                push: function (animation) {
                    this.animations[this.animations.length] = animation;
                    if (!this.running) {
                        this.running = true;
                        this.tick();
                    }
                }
            };
        return animationCollection;
    }(animate_requestAnimationFrame);
var utils_warn = function () {
        
        if (typeof console !== undefined && console.warn) {
            return function () {
                console.warn.apply(console, arguments);
            };
        }
        return function () {
        };
    }();
var utils_isNumeric = function () {
        
        return function (thing) {
            return !isNaN(parseFloat(thing)) && isFinite(thing);
        };
    }();
var shared_interpolate = function (isArray, isObject, isNumeric) {
        
        var interpolate = function (from, to) {
            if (isNumeric(from) && isNumeric(to)) {
                return makeNumberInterpolator(+from, +to);
            }
            if (isArray(from) && isArray(to)) {
                return makeArrayInterpolator(from, to);
            }
            if (isObject(from) && isObject(to)) {
                return makeObjectInterpolator(from, to);
            }
            return function () {
                return to;
            };
        };
        return interpolate;
        function makeNumberInterpolator(from, to) {
            var delta = to - from;
            if (!delta) {
                return function () {
                    return from;
                };
            }
            return function (t) {
                return from + t * delta;
            };
        }
        function makeArrayInterpolator(from, to) {
            var intermediate, interpolators, len, i;
            intermediate = [];
            interpolators = [];
            i = len = Math.min(from.length, to.length);
            while (i--) {
                interpolators[i] = interpolate(from[i], to[i]);
            }
            for (i = len; i < from.length; i += 1) {
                intermediate[i] = from[i];
            }
            for (i = len; i < to.length; i += 1) {
                intermediate[i] = to[i];
            }
            return function (t) {
                var i = len;
                while (i--) {
                    intermediate[i] = interpolators[i](t);
                }
                return intermediate;
            };
        }
        function makeObjectInterpolator(from, to) {
            var properties = [], len, interpolators, intermediate, prop;
            intermediate = {};
            interpolators = {};
            for (prop in from) {
                if (from.hasOwnProperty(prop)) {
                    if (to.hasOwnProperty(prop)) {
                        properties[properties.length] = prop;
                        interpolators[prop] = interpolate(from[prop], to[prop]);
                    } else {
                        intermediate[prop] = from[prop];
                    }
                }
            }
            for (prop in to) {
                if (to.hasOwnProperty(prop) && !from.hasOwnProperty(prop)) {
                    intermediate[prop] = to[prop];
                }
            }
            len = properties.length;
            return function (t) {
                var i = len, prop;
                while (i--) {
                    prop = properties[i];
                    intermediate[prop] = interpolators[prop](t);
                }
                return intermediate;
            };
        }
    }(utils_isArray, utils_isObject, utils_isNumeric);
var animate_Animation = function (warn, interpolate) {
        
        var Animation = function (options) {
            var key;
            this.startTime = Date.now();
            for (key in options) {
                if (options.hasOwnProperty(key)) {
                    this[key] = options[key];
                }
            }
            this.interpolator = interpolate(this.from, this.to);
            this.running = true;
        };
        Animation.prototype = {
            tick: function () {
                var elapsed, t, value, timeNow, index, keypath;
                keypath = this.keypath;
                if (this.running) {
                    timeNow = Date.now();
                    elapsed = timeNow - this.startTime;
                    if (elapsed >= this.duration) {
                        if (keypath !== null) {
                            this.root.set(keypath, this.to);
                        }
                        if (this.step) {
                            this.step(1, this.to);
                        }
                        if (this.complete) {
                            this.complete(1, this.to);
                        }
                        index = this.root._animations.indexOf(this);
                        if (index === -1) {
                            warn('Animation was not found');
                        }
                        this.root._animations.splice(index, 1);
                        this.running = false;
                        return false;
                    }
                    t = this.easing ? this.easing(elapsed / this.duration) : elapsed / this.duration;
                    if (keypath !== null) {
                        value = this.interpolator(t);
                        this.root.set(keypath, value);
                    }
                    if (this.step) {
                        this.step(t, value);
                    }
                    return true;
                }
                return false;
            },
            stop: function () {
                var index;
                this.running = false;
                index = this.root._animations.indexOf(this);
                if (index === -1) {
                    warn('Animation was not found');
                }
                this.root._animations.splice(index, 1);
            }
        };
        return Animation;
    }(utils_warn, shared_interpolate);
var registries_easing = function () {
        
        return {
            linear: function (pos) {
                return pos;
            },
            easeIn: function (pos) {
                return Math.pow(pos, 3);
            },
            easeOut: function (pos) {
                return Math.pow(pos - 1, 3) + 1;
            },
            easeInOut: function (pos) {
                if ((pos /= 0.5) < 1) {
                    return 0.5 * Math.pow(pos, 3);
                }
                return 0.5 * (Math.pow(pos - 2, 3) + 2);
            }
        };
    }();
var animate__index = function (isEqual, animationCollection, Animation, easingRegistry) {
        
        var animate, _animate, noAnimation;
        animate = function (keypath, to, options) {
            var k, animation, animations, easing, duration, step, complete, makeValueCollector, currentValues, collectValue, dummy, dummyOptions;
            if (typeof keypath === 'object') {
                options = to || {};
                easing = options.easing;
                duration = options.duration;
                animations = [];
                step = options.step;
                complete = options.complete;
                if (step || complete) {
                    currentValues = {};
                    options.step = null;
                    options.complete = null;
                    makeValueCollector = function (keypath) {
                        return function (t, value) {
                            currentValues[keypath] = value;
                        };
                    };
                }
                for (k in keypath) {
                    if (keypath.hasOwnProperty(k)) {
                        if (step || complete) {
                            collectValue = makeValueCollector(k);
                            options = {
                                easing: easing,
                                duration: duration
                            };
                            if (step) {
                                options.step = collectValue;
                            }
                            if (complete) {
                                options.complete = collectValue;
                            }
                        }
                        animations[animations.length] = animate(this, k, keypath[k], options);
                    }
                }
                if (step || complete) {
                    dummyOptions = {
                        easing: easing,
                        duration: duration
                    };
                    if (step) {
                        dummyOptions.step = function (t) {
                            step(t, currentValues);
                        };
                    }
                    if (complete) {
                        dummyOptions.complete = function (t) {
                            complete(t, currentValues);
                        };
                    }
                    animations[animations.length] = dummy = animate(this, null, null, dummyOptions);
                }
                return {
                    stop: function () {
                        while (animations.length) {
                            animations.pop().stop();
                        }
                        if (dummy) {
                            dummy.stop();
                        }
                    }
                };
            }
            options = options || {};
            animation = animate(this, keypath, to, options);
            return {
                stop: function () {
                    animation.stop();
                }
            };
        };
        noAnimation = {
            stop: function () {
            }
        };
        _animate = function (root, keypath, to, options) {
            var easing, duration, animation, i, from;
            if (keypath !== null) {
                from = root.get(keypath);
            }
            i = animationCollection.animations.length;
            while (i--) {
                animation = animationCollection.animations[i];
                if (animation.root === root && animation.keypath === keypath) {
                    animation.stop();
                }
            }
            if (isEqual(from, to)) {
                if (options.complete) {
                    options.complete(1, options.to);
                }
                return noAnimation;
            }
            if (options.easing) {
                if (typeof options.easing === 'function') {
                    easing = options.easing;
                } else {
                    if (root.easing && root.easing[options.easing]) {
                        easing = root.easing[options.easing];
                    } else {
                        easing = easingRegistry[options.easing];
                    }
                }
                if (typeof easing !== 'function') {
                    easing = null;
                }
            }
            duration = options.duration === undefined ? 400 : options.duration;
            animation = new Animation({
                keypath: keypath,
                from: from,
                to: to,
                root: root,
                duration: duration,
                easing: easing,
                step: options.step,
                complete: options.complete
            });
            animationCollection.push(animation);
            root._animations[root._animations.length] = animation;
            return animation;
        };
    }(utils_isEqual, animate_animationCollection, animate_Animation, registries_easing);
var prototype_on = function () {
        
        return function (eventName, callback) {
            var self = this, listeners, n;
            if (typeof eventName === 'object') {
                listeners = [];
                for (n in eventName) {
                    if (eventName.hasOwnProperty(n)) {
                        listeners[listeners.length] = this.on(n, eventName[n]);
                    }
                }
                return {
                    cancel: function () {
                        while (listeners.length) {
                            listeners.pop().cancel();
                        }
                    }
                };
            }
            if (!this._subs[eventName]) {
                this._subs[eventName] = [callback];
            } else {
                this._subs[eventName].push(callback);
            }
            return {
                cancel: function () {
                    self.off(eventName, callback);
                }
            };
        };
    }();
var prototype_off = function () {
        
        return function (eventName, callback) {
            var subscribers, index;
            if (!callback) {
                if (!eventName) {
                    this._subs = {};
                } else {
                    this._subs[eventName] = [];
                }
            }
            subscribers = this._subs[eventName];
            if (subscribers) {
                index = subscribers.indexOf(callback);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
            }
        };
    }();
var shared_registerDependant = function () {
        
        return function (dependant) {
            var depsByKeypath, deps, keys, parentKeypath, map, ractive, keypath, priority;
            ractive = dependant.root;
            keypath = dependant.keypath;
            priority = dependant.priority;
            depsByKeypath = ractive._deps[priority] || (ractive._deps[priority] = {});
            deps = depsByKeypath[keypath] || (depsByKeypath[keypath] = []);
            deps[deps.length] = dependant;
            keys = keypath.split('.');
            while (keys.length) {
                keys.pop();
                parentKeypath = keys.join('.');
                map = ractive._depsMap[parentKeypath] || (ractive._depsMap[parentKeypath] = []);
                if (map[keypath] === undefined) {
                    map[keypath] = 0;
                    map[map.length] = keypath;
                }
                map[keypath] += 1;
                keypath = parentKeypath;
            }
        };
    }();
var shared_unregisterDependant = function () {
        
        return function (dependant) {
            var deps, keys, parentKeypath, map, ractive, keypath, priority;
            ractive = dependant.root;
            keypath = dependant.keypath;
            priority = dependant.priority;
            deps = ractive._deps[priority][keypath];
            deps.splice(deps.indexOf(dependant), 1);
            keys = keypath.split('.');
            while (keys.length) {
                keys.pop();
                parentKeypath = keys.join('.');
                map = ractive._depsMap[parentKeypath];
                map[keypath] -= 1;
                if (!map[keypath]) {
                    map.splice(map.indexOf(keypath), 1);
                    map[keypath] = undefined;
                }
                keypath = parentKeypath;
            }
        };
    }();
var prototype_observe = function (isEqual, registerDependant, unregisterDependant) {
        
        var observe, getObserverFacade, Observer;
        observe = function (keypath, callback, options) {
            var observers = [], k;
            if (typeof keypath === 'object') {
                options = callback;
                for (k in keypath) {
                    if (keypath.hasOwnProperty(k)) {
                        callback = keypath[k];
                        observers[observers.length] = getObserverFacade(this, k, callback, options);
                    }
                }
                return {
                    cancel: function () {
                        while (observers.length) {
                            observers.pop().cancel();
                        }
                    }
                };
            }
            return getObserverFacade(this, keypath, callback, options);
        };
        getObserverFacade = function (root, keypath, callback, options) {
            var observer;
            options = options || {};
            observer = new Observer(root, keypath, callback, options);
            if (options.init !== false) {
                observer.update();
            }
            observer.ready = true;
            registerDependant(observer);
            return {
                cancel: function () {
                    unregisterDependant(observer);
                }
            };
        };
        Observer = function (root, keypath, callback, options) {
            this.root = root;
            this.keypath = keypath;
            this.callback = callback;
            this.defer = options.defer;
            this.priority = 0;
            this.context = options && options.context ? options.context : root;
        };
        Observer.prototype = {
            update: function (deferred) {
                var value;
                if (this.defer && !deferred && this.ready) {
                    this.root._defObservers.push(this);
                    return;
                }
                if (this.updating) {
                    return;
                }
                this.updating = true;
                value = this.root.get(this.keypath, true);
                if (!isEqual(value, this.value) || !this.ready) {
                    try {
                        this.callback.call(this.context, value, this.value);
                    } catch (err) {
                        if (this.root.debug) {
                            throw err;
                        }
                    }
                    this.value = value;
                }
                this.updating = false;
            }
        };
        return observe;
    }(utils_isEqual, shared_registerDependant, shared_unregisterDependant);
var prototype_fire = function () {
        
        return function (eventName) {
            var args, i, len, subscribers = this._subs[eventName];
            if (!subscribers) {
                return;
            }
            args = Array.prototype.slice.call(arguments, 1);
            for (i = 0, len = subscribers.length; i < len; i += 1) {
                subscribers[i].apply(this, args);
            }
        };
    }();
var prototype_find = function () {
        
        return function (selector) {
            if (!this.el) {
                return null;
            }
            return this.el.querySelector(selector);
        };
    }();
var prototype_findAll = function (warn) {
        
        var tagSelector = /^[a-zA-Z][a-zA-Z0-9\-]*$/, classSelector = /^\.[^\s]+$/g;
        return function (selector, live) {
            var errorMessage;
            if (!this.el) {
                return [];
            }
            if (live) {
                if (tagSelector.test(selector)) {
                    return this.el.getElementsByTagName(selector);
                }
                if (classSelector.test(selector)) {
                    return this.el.getElementsByClassName(selector.substring(1));
                }
                errorMessage = 'Could not generate live nodelist from "' + selector + '" selector';
                if (this.debug) {
                    throw new Error(errorMessage);
                } else {
                    warn(errorMessage);
                }
            }
            return this.el.querySelectorAll(selector);
        };
    }(utils_warn);
var prototype_renderHTML = function () {
        
        return function () {
            return this.fragment.toString();
        };
    }();
var prototype_teardown = function (makeTransitionManager, clearCache) {
        
        return function (complete) {
            var keypath, transitionManager, previousTransitionManager;
            this.fire('teardown');
            previousTransitionManager = this._transitionManager;
            this._transitionManager = transitionManager = makeTransitionManager(this, complete);
            this.fragment.teardown(true);
            while (this._animations[0]) {
                this._animations[0].stop();
            }
            for (keypath in this._cache) {
                clearCache(this, keypath);
            }
            this._transitionManager = previousTransitionManager;
            transitionManager.ready();
        };
    }(shared_makeTransitionManager, shared_clearCache);
var shared_add = function (require, utils_isNumeric) {
        
        var isNumeric = utils_isNumeric;
        return function (root, keypath, d) {
            var value;
            if (typeof keypath !== 'string' || !isNumeric(d)) {
                if (root.debug) {
                    throw new Error('Bad arguments');
                }
                return;
            }
            value = root.get(keypath);
            if (value === undefined) {
                value = 0;
            }
            if (!isNumeric(value)) {
                if (root.debug) {
                    throw new Error('Cannot add to a non-numeric value');
                }
                return;
            }
            root.set(keypath, value + d);
        };
    }({}, utils_isNumeric);
var prototype_add = function (add) {
        
        return function (keypath, d) {
            add(this, keypath, d === undefined ? 1 : d);
        };
    }(shared_add);
var prototype_subtract = function (add) {
        
        return function (keypath, d) {
            add(this, keypath, d === undefined ? -1 : -d);
        };
    }(shared_add);
var prototype_toggle = function () {
        
        return function (keypath) {
            var value;
            if (typeof keypath !== 'string') {
                if (this.debug) {
                    throw new Error('Bad arguments');
                }
                return;
            }
            value = this.get(keypath);
            this.set(keypath, !value);
        };
    }();
var prototype__index = function (get, set, update, updateModel, animate, on, off, observe, fire, find, findAll, renderHTML, teardown, add, subtract, toggle) {
        
        return {
            get: get,
            set: set,
            update: update,
            updateModel: updateModel,
            on: on,
            off: off,
            observe: observe,
            fire: fire,
            find: find,
            findAll: findAll,
            renderHTML: renderHTML,
            teardown: teardown,
            add: add,
            subtract: subtract,
            toggle: toggle
        };
    }(get__index, prototype_set, prototype_update, prototype_updateModel, animate__index, prototype_on, prototype_off, prototype_observe, prototype_fire, prototype_find, prototype_findAll, prototype_renderHTML, prototype_teardown, prototype_add, prototype_subtract, prototype_toggle);
var registries_partials = {};
var config_errors = { missingParser: 'Missing Ractive.parse - cannot parse template. Either preparse or use the version that includes the parser' };
var utils_extend = function () {
        
        return function (target) {
            var prop, source, sources = Array.prototype.slice.call(arguments, 1);
            while (source = sources.shift()) {
                for (prop in source) {
                    if (source.hasOwnProperty(prop)) {
                        target[prop] = source[prop];
                    }
                }
            }
            return target;
        };
    }();
var utils_getElement = function () {
        
        return function (input) {
            var output;
            if (typeof window === 'undefined' || !document || !input) {
                return null;
            }
            if (input.nodeType) {
                return input;
            }
            if (typeof input === 'string') {
                output = document.getElementById(input);
                if (!output && document.querySelector) {
                    output = document.querySelector(input);
                }
                if (output.nodeType) {
                    return output;
                }
            }
            if (input[0] && input[0].nodeType) {
                return input[0];
            }
            return null;
        };
    }();
var shared_initFragment = function (types, create) {
        
        return function (fragment, options) {
            var numItems, i, parentFragment, parentRefs, ref;
            fragment.owner = options.owner;
            parentFragment = fragment.owner.parentFragment;
            fragment.root = options.root;
            fragment.parentNode = options.parentNode;
            fragment.contextStack = options.contextStack || [];
            if (fragment.owner.type === types.SECTION) {
                fragment.index = options.index;
            }
            if (parentFragment) {
                parentRefs = parentFragment.indexRefs;
                if (parentRefs) {
                    fragment.indexRefs = create(null);
                    for (ref in parentRefs) {
                        fragment.indexRefs[ref] = parentRefs[ref];
                    }
                }
            }
            fragment.priority = parentFragment ? parentFragment.priority + 1 : 1;
            if (options.indexRef) {
                if (!fragment.indexRefs) {
                    fragment.indexRefs = {};
                }
                fragment.indexRefs[options.indexRef] = options.index;
            }
            fragment.items = [];
            numItems = options.descriptor ? options.descriptor.length : 0;
            for (i = 0; i < numItems; i += 1) {
                fragment.items[fragment.items.length] = fragment.createItem({
                    parentFragment: fragment,
                    descriptor: options.descriptor[i],
                    index: i
                });
            }
        };
    }(config_types, utils_create);
var shared_insertHtml = function () {
        
        var elementCache = {};
        return function (html, tagName, docFrag) {
            var container, nodes = [];
            container = elementCache[tagName] || (elementCache[tagName] = document.createElement(tagName));
            container.innerHTML = html;
            while (container.firstChild) {
                nodes[nodes.length] = container.firstChild;
                docFrag.appendChild(container.firstChild);
            }
            return nodes;
        };
    }();
var DomFragment_Text = function (types) {
        
        var DomText = function (options, docFrag) {
            this.type = types.TEXT;
            this.descriptor = options.descriptor;
            if (docFrag) {
                this.node = document.createTextNode(options.descriptor);
                this.parentNode = options.parentFragment.parentNode;
                docFrag.appendChild(this.node);
            }
        };
        DomText.prototype = {
            teardown: function (detach) {
                if (detach) {
                    this.node.parentNode.removeChild(this.node);
                }
            },
            firstNode: function () {
                return this.node;
            },
            toString: function () {
                return ('' + this.descriptor).replace('<', '&lt;').replace('>', '&gt;');
            }
        };
        return DomText;
    }(config_types);
var shared_teardown = function (unregisterDependant) {
        
        return function (thing) {
            if (!thing.keypath) {
                var index = thing.root._pendingResolution.indexOf(thing);
                if (index !== -1) {
                    thing.root._pendingResolution.splice(index, 1);
                }
            } else {
                unregisterDependant(thing);
            }
        };
    }(shared_unregisterDependant);
var Evaluator_Reference = function (types, isEqual, defineProperty, registerDependant, unregisterDependant) {
        
        var Reference, thisPattern;
        thisPattern = /this/;
        Reference = function (root, keypath, evaluator, argNum, priority) {
            var value;
            this.evaluator = evaluator;
            this.keypath = keypath;
            this.root = root;
            this.argNum = argNum;
            this.type = types.REFERENCE;
            this.priority = priority;
            value = root.get(keypath);
            if (typeof value === 'function') {
                value = value._wrapped || wrapFunction(value, root, evaluator);
            }
            this.value = evaluator.values[argNum] = value;
            registerDependant(this);
        };
        Reference.prototype = {
            update: function () {
                var value = this.root.get(this.keypath);
                if (typeof value === 'function' && !value._nowrap) {
                    value = value['_' + this.root._guid] || wrapFunction(value, this.root, this.evaluator);
                }
                if (!isEqual(value, this.value)) {
                    this.evaluator.values[this.argNum] = value;
                    this.evaluator.bubble();
                    this.value = value;
                }
            },
            teardown: function () {
                unregisterDependant(this);
            }
        };
        return Reference;
        function wrapFunction(fn, ractive, evaluator) {
            var prop;
            if (!thisPattern.test(fn.toString())) {
                defineProperty(fn, '_nowrap', { value: true });
                return fn;
            }
            defineProperty(fn, '_' + ractive._guid, {
                value: function () {
                    var originalGet, result, softDependencies;
                    originalGet = ractive.get;
                    ractive.get = function (keypath) {
                        if (!softDependencies) {
                            softDependencies = [];
                        }
                        if (!softDependencies[keypath]) {
                            softDependencies[softDependencies.length] = keypath;
                            softDependencies[keypath] = true;
                        }
                        return originalGet.call(ractive, keypath);
                    };
                    result = fn.apply(ractive, arguments);
                    if (softDependencies) {
                        evaluator.updateSoftDependencies(softDependencies);
                    }
                    ractive.get = originalGet;
                    return result;
                },
                writable: true
            });
            for (prop in fn) {
                if (fn.hasOwnProperty(prop)) {
                    fn['_' + ractive._guid][prop] = fn[prop];
                }
            }
            return fn['_' + ractive._guid];
        }
    }(config_types, utils_isEqual, utils_defineProperty, shared_registerDependant, shared_unregisterDependant);
var Evaluator_SoftReference = function (isEqual, registerDependant, unregisterDependant) {
        
        var SoftReference = function (root, keypath, evaluator) {
            this.root = root;
            this.keypath = keypath;
            this.priority = evaluator.priority;
            this.evaluator = evaluator;
            registerDependant(this);
        };
        SoftReference.prototype = {
            update: function () {
                var value = this.root.get(this.keypath);
                if (!isEqual(value, this.value)) {
                    this.evaluator.bubble();
                    this.value = value;
                }
            },
            teardown: function () {
                unregisterDependant(this);
            }
        };
        return SoftReference;
    }(utils_isEqual, shared_registerDependant, shared_unregisterDependant);
var Evaluator__index = function (isEqual, defineProperty, clearCache, notifyDependants, registerDependant, unregisterDependant, Reference, SoftReference) {
        
        var Evaluator, cache = {};
        Evaluator = function (root, keypath, functionStr, args, priority) {
            var i, arg;
            this.root = root;
            this.keypath = keypath;
            this.priority = priority;
            this.fn = getFunctionFromString(functionStr, args.length);
            this.values = [];
            this.refs = [];
            i = args.length;
            while (i--) {
                if (arg = args[i]) {
                    if (arg[0]) {
                        this.values[i] = arg[1];
                    } else {
                        this.refs[this.refs.length] = new Reference(root, arg[1], this, i, priority);
                    }
                } else {
                    this.values[i] = undefined;
                }
            }
            this.selfUpdating = this.refs.length <= 1;
            this.update();
        };
        Evaluator.prototype = {
            bubble: function () {
                if (this.selfUpdating) {
                    this.update();
                } else if (!this.deferred) {
                    this.root._defEvals[this.root._defEvals.length] = this;
                    this.deferred = true;
                }
            },
            update: function () {
                var value;
                if (this.evaluating) {
                    return this;
                }
                this.evaluating = true;
                try {
                    value = this.fn.apply(null, this.values);
                } catch (err) {
                    if (this.root.debug) {
                        throw err;
                    } else {
                        value = undefined;
                    }
                }
                if (!isEqual(value, this.value)) {
                    clearCache(this.root, this.keypath);
                    this.root._cache[this.keypath] = value;
                    notifyDependants(this.root, this.keypath);
                    this.value = value;
                }
                this.evaluating = false;
                return this;
            },
            teardown: function () {
                while (this.refs.length) {
                    this.refs.pop().teardown();
                }
                clearCache(this.root, this.keypath);
                this.root._evaluators[this.keypath] = null;
            },
            refresh: function () {
                if (!this.selfUpdating) {
                    this.deferred = true;
                }
                var i = this.refs.length;
                while (i--) {
                    this.refs[i].update();
                }
                if (this.deferred) {
                    this.update();
                    this.deferred = false;
                }
            },
            updateSoftDependencies: function (softDeps) {
                var i, keypath, ref;
                if (!this.softRefs) {
                    this.softRefs = [];
                }
                i = this.softRefs.length;
                while (i--) {
                    ref = this.softRefs[i];
                    if (!softDeps[ref.keypath]) {
                        this.softRefs.splice(i, 1);
                        this.softRefs[ref.keypath] = false;
                        ref.teardown();
                    }
                }
                i = softDeps.length;
                while (i--) {
                    keypath = softDeps[i];
                    if (!this.softRefs[keypath]) {
                        ref = new SoftReference(this.root, keypath, this);
                        this.softRefs[this.softRefs.length] = ref;
                        this.softRefs[keypath] = true;
                    }
                }
                this.selfUpdating = this.refs.length + this.softRefs.length <= 1;
            }
        };
        return Evaluator;
        function getFunctionFromString(str, i) {
            var fn, args;
            str = str.replace(/\$\{([0-9]+)\}/g, '_$1');
            if (cache[str]) {
                return cache[str];
            }
            args = [];
            while (i--) {
                args[i] = '_' + i;
            }
            fn = new Function(args.join(','), 'return(' + str + ')');
            cache[str] = fn;
            return fn;
        }
    }(utils_isEqual, utils_defineProperty, shared_clearCache, shared_notifyDependants, shared_registerDependant, shared_unregisterDependant, Evaluator_Reference, Evaluator_SoftReference);
var shared_ExpressionResolver = function (resolveRef, teardown, Evaluator) {
        
        var ExpressionResolver, ReferenceScout, getKeypath;
        ExpressionResolver = function (mustache) {
            var expression, i, len, ref, indexRefs;
            this.root = mustache.root;
            this.mustache = mustache;
            this.args = [];
            this.scouts = [];
            expression = mustache.descriptor.x;
            indexRefs = mustache.parentFragment.indexRefs;
            this.str = expression.s;
            len = this.unresolved = this.args.length = expression.r ? expression.r.length : 0;
            if (!len) {
                this.resolved = this.ready = true;
                this.bubble();
                return;
            }
            for (i = 0; i < len; i += 1) {
                ref = expression.r[i];
                if (indexRefs && indexRefs[ref] !== undefined) {
                    this.resolveRef(i, true, indexRefs[ref]);
                } else {
                    this.scouts[this.scouts.length] = new ReferenceScout(this, ref, mustache.contextStack, i);
                }
            }
            this.ready = true;
            this.bubble();
        };
        ExpressionResolver.prototype = {
            bubble: function () {
                if (!this.ready) {
                    return;
                }
                this.keypath = getKeypath(this.str, this.args);
                this.createEvaluator();
                this.mustache.resolve(this.keypath);
            },
            teardown: function () {
                while (this.scouts.length) {
                    this.scouts.pop().teardown();
                }
            },
            resolveRef: function (argNum, isIndexRef, value) {
                this.args[argNum] = [
                    isIndexRef,
                    value
                ];
                this.bubble();
                this.resolved = !--this.unresolved;
            },
            createEvaluator: function () {
                if (!this.root._evaluators[this.keypath]) {
                    this.root._evaluators[this.keypath] = new Evaluator(this.root, this.keypath, this.str, this.args, this.mustache.priority);
                } else {
                    this.root._evaluators[this.keypath].refresh();
                }
            }
        };
        ReferenceScout = function (resolver, ref, contextStack, argNum) {
            var keypath, root;
            root = this.root = resolver.root;
            keypath = resolveRef(root, ref, contextStack);
            if (keypath) {
                resolver.resolveRef(argNum, false, keypath);
            } else {
                this.ref = ref;
                this.argNum = argNum;
                this.resolver = resolver;
                this.contextStack = contextStack;
                root._pendingResolution[root._pendingResolution.length] = this;
            }
        };
        ReferenceScout.prototype = {
            resolve: function (keypath) {
                this.keypath = keypath;
                this.resolver.resolveRef(this.argNum, false, keypath);
            },
            teardown: function () {
                if (!this.keypath) {
                    teardown(this);
                }
            }
        };
        getKeypath = function (str, args) {
            var unique;
            unique = str.replace(/\$\{([0-9]+)\}/g, function (match, $1) {
                return args[$1] ? args[$1][1] : 'undefined';
            });
            return '(' + unique.replace(/[\.\[\]]/g, '-') + ')';
        };
        return ExpressionResolver;
    }(shared_resolveRef, shared_teardown, Evaluator__index);
var shared_initMustache = function (resolveRef, ExpressionResolver) {
        
        return function (mustache, options) {
            var keypath, indexRef, parentFragment;
            parentFragment = mustache.parentFragment = options.parentFragment;
            mustache.root = parentFragment.root;
            mustache.contextStack = parentFragment.contextStack;
            mustache.descriptor = options.descriptor;
            mustache.index = options.index || 0;
            mustache.priority = parentFragment.priority;
            if (parentFragment.parentNode) {
                mustache.parentNode = parentFragment.parentNode;
            }
            mustache.type = options.descriptor.t;
            if (options.descriptor.r) {
                if (parentFragment.indexRefs && parentFragment.indexRefs[options.descriptor.r] !== undefined) {
                    indexRef = parentFragment.indexRefs[options.descriptor.r];
                    mustache.indexRef = options.descriptor.r;
                    mustache.value = indexRef;
                    mustache.render(mustache.value);
                } else {
                    keypath = resolveRef(mustache.root, options.descriptor.r, mustache.contextStack);
                    if (keypath) {
                        mustache.resolve(keypath);
                    } else {
                        mustache.ref = options.descriptor.r;
                        mustache.root._pendingResolution[mustache.root._pendingResolution.length] = mustache;
                        if (mustache.descriptor.n) {
                            mustache.render(false);
                        }
                    }
                }
            }
            if (options.descriptor.x) {
                mustache.expressionResolver = new ExpressionResolver(mustache);
            }
        };
    }(shared_resolveRef, shared_ExpressionResolver);
var shared_resolveMustache = function (registerDependant, unregisterDependant) {
        
        return function (keypath) {
            if (this.resolved) {
                unregisterDependant(this);
            }
            this.keypath = keypath;
            registerDependant(this);
            this.update();
            if (this.expressionResolver && this.expressionResolver.resolved) {
                this.expressionResolver = null;
            }
            this.resolved = true;
        };
    }(shared_registerDependant, shared_unregisterDependant);
var shared_updateMustache = function (isEqual) {
        
        return function () {
            var value = this.root.get(this.keypath, true);
            if (!isEqual(value, this.value)) {
                this.render(value);
                this.value = value;
            }
        };
    }(utils_isEqual);
var DomFragment_Interpolator = function (types, teardown, initMustache, resolveMustache, updateMustache) {
        
        var DomInterpolator = function (options, docFrag) {
            this.type = types.INTERPOLATOR;
            if (docFrag) {
                this.node = document.createTextNode('');
                docFrag.appendChild(this.node);
            }
            initMustache(this, options);
        };
        DomInterpolator.prototype = {
            update: updateMustache,
            resolve: resolveMustache,
            teardown: function (detach) {
                teardown(this);
                if (detach) {
                    this.node.parentNode.removeChild(this.node);
                }
            },
            render: function (value) {
                if (this.node) {
                    this.node.data = value === undefined ? '' : value;
                }
            },
            firstNode: function () {
                return this.node;
            },
            toString: function () {
                var value = this.value !== undefined ? '' + this.value : '';
                return value.replace('<', '&lt;').replace('>', '&gt;');
            }
        };
        return DomInterpolator;
    }(config_types, shared_teardown, shared_initMustache, shared_resolveMustache, shared_updateMustache);
var shared_updateSection = function (isArray, isObject, create) {
        
        return function (section, value) {
            var fragmentOptions;
            fragmentOptions = {
                descriptor: section.descriptor.f,
                root: section.root,
                parentNode: section.parentNode,
                owner: section
            };
            if (section.descriptor.n) {
                updateConditionalSection(section, value, true, fragmentOptions);
                return;
            }
            if (isArray(value)) {
                updateListSection(section, value, fragmentOptions);
            } else if (isObject(value)) {
                if (section.descriptor.i) {
                    updateListObjectSection(section, value, fragmentOptions);
                } else {
                    updateContextSection(section, fragmentOptions);
                }
            } else {
                updateConditionalSection(section, value, false, fragmentOptions);
            }
        };
        function updateListSection(section, value, fragmentOptions) {
            var i, length, fragmentsToRemove;
            length = value.length;
            if (length < section.length) {
                fragmentsToRemove = section.fragments.splice(length, section.length - length);
                while (fragmentsToRemove.length) {
                    fragmentsToRemove.pop().teardown(true);
                }
            } else {
                if (length > section.length) {
                    for (i = section.length; i < length; i += 1) {
                        fragmentOptions.contextStack = section.contextStack.concat(section.keypath + '.' + i);
                        fragmentOptions.index = i;
                        if (section.descriptor.i) {
                            fragmentOptions.indexRef = section.descriptor.i;
                        }
                        section.fragments[i] = section.createFragment(fragmentOptions);
                    }
                }
            }
            section.length = length;
        }
        function updateListObjectSection(section, value, fragmentOptions) {
            var id, fragmentsById;
            fragmentsById = section.fragmentsById || (section.fragmentsById = create(null));
            for (id in fragmentsById) {
                if (value[id] === undefined && fragmentsById[id]) {
                    fragmentsById[id].teardown(true);
                    fragmentsById[id] = null;
                }
            }
            for (id in value) {
                if (value[id] !== undefined && !fragmentsById[id]) {
                    fragmentOptions.contextStack = section.contextStack.concat(section.keypath + '.' + id);
                    fragmentOptions.index = id;
                    if (section.descriptor.i) {
                        fragmentOptions.indexRef = section.descriptor.i;
                    }
                    fragmentsById[id] = section.createFragment(fragmentOptions);
                }
            }
        }
        function updateContextSection(section, fragmentOptions) {
            if (!section.length) {
                fragmentOptions.contextStack = section.contextStack.concat(section.keypath);
                fragmentOptions.index = 0;
                section.fragments[0] = section.createFragment(fragmentOptions);
                section.length = 1;
            }
        }
        function updateConditionalSection(section, value, inverted, fragmentOptions) {
            var doRender, emptyArray, fragmentsToRemove;
            emptyArray = isArray(value) && value.length === 0;
            if (inverted) {
                doRender = emptyArray || !value;
            } else {
                doRender = value && !emptyArray;
            }
            if (doRender) {
                if (!section.length) {
                    fragmentOptions.contextStack = section.contextStack;
                    fragmentOptions.index = 0;
                    section.fragments[0] = section.createFragment(fragmentOptions);
                    section.length = 1;
                }
                if (section.length > 1) {
                    fragmentsToRemove = section.fragments.splice(1);
                    while (fragmentsToRemove.length) {
                        fragmentsToRemove.pop().teardown(true);
                    }
                }
            } else if (section.length) {
                section.teardownFragments(true);
                section.length = 0;
            }
        }
    }(utils_isArray, utils_isObject, utils_create);
var shared_reassignFragments = function (types, unregisterDependant, processDeferredUpdates, ExpressionResolver) {
        
        return function (root, section, start, end, by) {
            var i, fragment, indexRef, oldIndex, newIndex, oldKeypath, newKeypath;
            indexRef = section.descriptor.i;
            for (i = start; i < end; i += 1) {
                fragment = section.fragments[i];
                if (fragment.html) {
                    continue;
                }
                oldIndex = i - by;
                newIndex = i;
                oldKeypath = section.keypath + '.' + (i - by);
                newKeypath = section.keypath + '.' + i;
                fragment.index += by;
                reassignFragment(fragment, indexRef, oldIndex, newIndex, by, oldKeypath, newKeypath);
            }
            processDeferredUpdates(root);
        };
        function reassignFragment(fragment, indexRef, oldIndex, newIndex, by, oldKeypath, newKeypath) {
            var i, item, context;
            if (fragment.indexRefs && fragment.indexRefs[indexRef] !== undefined) {
                fragment.indexRefs[indexRef] = newIndex;
            }
            i = fragment.contextStack.length;
            while (i--) {
                context = fragment.contextStack[i];
                if (context.substr(0, oldKeypath.length) === oldKeypath) {
                    fragment.contextStack[i] = context.replace(oldKeypath, newKeypath);
                }
            }
            i = fragment.items.length;
            while (i--) {
                item = fragment.items[i];
                switch (item.type) {
                case types.ELEMENT:
                    reassignElement(item, indexRef, oldIndex, newIndex, by, oldKeypath, newKeypath);
                    break;
                case types.PARTIAL:
                    reassignFragment(item.fragment, indexRef, oldIndex, newIndex, by, oldKeypath, newKeypath);
                    break;
                case types.SECTION:
                case types.INTERPOLATOR:
                case types.TRIPLE:
                    reassignMustache(item, indexRef, oldIndex, newIndex, by, oldKeypath, newKeypath);
                    break;
                }
            }
        }
        function reassignElement(element, indexRef, oldIndex, newIndex, by, oldKeypath, newKeypath) {
            var i, attribute, storage, masterEventName, proxies, proxy;
            i = element.attributes.length;
            while (i--) {
                attribute = element.attributes[i];
                if (attribute.fragment) {
                    reassignFragment(attribute.fragment, indexRef, oldIndex, newIndex, by, oldKeypath, newKeypath);
                    if (attribute.twoway) {
                        attribute.updateBindings();
                    }
                }
            }
            if (storage = element.node._ractive) {
                if (storage.keypath.substr(0, oldKeypath.length) === oldKeypath) {
                    storage.keypath = storage.keypath.replace(oldKeypath, newKeypath);
                }
                if (indexRef !== undefined) {
                    storage.index[indexRef] = newIndex;
                }
                for (masterEventName in storage.events) {
                    proxies = storage.events[masterEventName].proxies;
                    i = proxies.length;
                    while (i--) {
                        proxy = proxies[i];
                        if (typeof proxy.n === 'object') {
                            reassignFragment(proxy.a, indexRef, oldIndex, newIndex, by, oldKeypath, newKeypath);
                        }
                        if (proxy.d) {
                            reassignFragment(proxy.d, indexRef, oldIndex, newIndex, by, oldKeypath, newKeypath);
                        }
                    }
                }
                if (storage.binding) {
                    if (storage.binding.keypath.substr(0, oldKeypath.length) === oldKeypath) {
                        storage.binding.keypath = storage.binding.keypath.replace(oldKeypath, newKeypath);
                    }
                }
            }
            if (element.fragment) {
                reassignFragment(element.fragment, indexRef, oldIndex, newIndex, by, oldKeypath, newKeypath);
            }
        }
        function reassignMustache(mustache, indexRef, oldIndex, newIndex, by, oldKeypath, newKeypath) {
            var i;
            if (mustache.descriptor.x) {
                if (mustache.keypath) {
                    unregisterDependant(mustache);
                }
                if (mustache.expressionResolver) {
                    mustache.expressionResolver.teardown();
                }
                mustache.expressionResolver = new ExpressionResolver(mustache);
            }
            if (mustache.keypath) {
                if (mustache.keypath.substr(0, oldKeypath.length) === oldKeypath) {
                    mustache.resolve(mustache.keypath.replace(oldKeypath, newKeypath));
                }
            } else if (mustache.indexRef === indexRef) {
                mustache.value = newIndex;
                mustache.render(newIndex);
            }
            if (mustache.fragments) {
                i = mustache.fragments.length;
                while (i--) {
                    reassignFragment(mustache.fragments[i], indexRef, oldIndex, newIndex, by, oldKeypath, newKeypath);
                }
            }
        }
    }(config_types, shared_unregisterDependant, shared_processDeferredUpdates, shared_ExpressionResolver);
var DomFragment_Section = function (types, initMustache, updateMustache, resolveMustache, updateSection, reassignFragments, teardown) {
        
        var DomSection, DomFragment;
        loadCircularDependency(function () {
            (function (dep) {
                DomFragment = dep;
            }(DomFragment__index));
        });
        DomSection = function (options, docFrag) {
            this.type = types.SECTION;
            this.fragments = [];
            this.length = 0;
            if (docFrag) {
                this.docFrag = document.createDocumentFragment();
            }
            this.initialising = true;
            initMustache(this, options);
            if (docFrag) {
                docFrag.appendChild(this.docFrag);
            }
            this.initialising = false;
        };
        DomSection.prototype = {
            update: updateMustache,
            resolve: resolveMustache,
            smartUpdate: function (methodName, args) {
                var fragmentOptions;
                if (methodName === 'push' || methodName === 'unshift' || methodName === 'splice') {
                    fragmentOptions = {
                        descriptor: this.descriptor.f,
                        root: this.root,
                        parentNode: this.parentNode,
                        owner: this
                    };
                    if (this.descriptor.i) {
                        fragmentOptions.indexRef = this.descriptor.i;
                    }
                }
                if (this[methodName]) {
                    this[methodName](fragmentOptions, args);
                }
            },
            pop: function () {
                if (this.length) {
                    this.fragments.pop().teardown(true);
                    this.length -= 1;
                }
            },
            push: function (fragmentOptions, args) {
                var start, end, i;
                start = this.length;
                end = start + args.length;
                for (i = start; i < end; i += 1) {
                    fragmentOptions.contextStack = this.contextStack.concat(this.keypath + '.' + i);
                    fragmentOptions.index = i;
                    this.fragments[i] = this.createFragment(fragmentOptions);
                }
                this.length += args.length;
                this.parentNode.insertBefore(this.docFrag, this.parentFragment.findNextNode(this));
            },
            shift: function () {
                this.splice(null, [
                    0,
                    1
                ]);
            },
            unshift: function (fragmentOptions, args) {
                this.splice(fragmentOptions, [
                    0,
                    0
                ].concat(new Array(args.length)));
            },
            splice: function (fragmentOptions, args) {
                var insertionPoint, addedItems, removedItems, balance, i, start, end, spliceArgs, reassignStart;
                if (!args.length) {
                    return;
                }
                start = +(args[0] < 0 ? this.length + args[0] : args[0]);
                addedItems = Math.max(0, args.length - 2);
                removedItems = args[1] !== undefined ? args[1] : this.length - start;
                balance = addedItems - removedItems;
                if (!balance) {
                    return;
                }
                if (balance < 0) {
                    end = start - balance;
                    for (i = start; i < end; i += 1) {
                        this.fragments[i].teardown(true);
                    }
                    this.fragments.splice(start, -balance);
                } else {
                    end = start + balance;
                    insertionPoint = this.fragments[start] ? this.fragments[start].firstNode() : this.parentFragment.findNextNode(this);
                    spliceArgs = [
                        start,
                        0
                    ].concat(new Array(balance));
                    this.fragments.splice.apply(this.fragments, spliceArgs);
                    for (i = start; i < end; i += 1) {
                        fragmentOptions.contextStack = this.contextStack.concat(this.keypath + '.' + i);
                        fragmentOptions.index = i;
                        this.fragments[i] = this.createFragment(fragmentOptions);
                    }
                    this.parentNode.insertBefore(this.docFrag, insertionPoint);
                }
                this.length += balance;
                reassignStart = start + addedItems;
                reassignFragments(this.root, this, reassignStart, this.length, balance);
            },
            teardown: function (detach) {
                this.teardownFragments(detach);
                teardown(this);
            },
            firstNode: function () {
                if (this.fragments[0]) {
                    return this.fragments[0].firstNode();
                }
                return this.parentFragment.findNextNode(this);
            },
            findNextNode: function (fragment) {
                if (this.fragments[fragment.index + 1]) {
                    return this.fragments[fragment.index + 1].firstNode();
                }
                return this.parentFragment.findNextNode(this);
            },
            teardownFragments: function (detach) {
                var id;
                while (this.fragments.length) {
                    this.fragments.shift().teardown(detach);
                }
                if (this.fragmentsById) {
                    for (id in this.fragmentsById) {
                        if (this.fragments[id]) {
                            this.fragmentsById[id].teardown();
                            this.fragmentsById[id] = null;
                        }
                    }
                }
            },
            render: function (value) {
                var next, wrapped;
                if (wrapped = this.root._wrapped[this.keypath]) {
                    value = wrapped.get();
                }
                if (this.rendering) {
                    return;
                }
                this.rendering = true;
                updateSection(this, value);
                this.rendering = false;
                if (this.docFrag && !this.docFrag.childNodes.length) {
                    return;
                }
                if (!this.initialising) {
                    next = this.parentFragment.findNextNode(this);
                    if (next && next.parentNode === this.parentNode) {
                        this.parentNode.insertBefore(this.docFrag, next);
                    } else {
                        this.parentNode.appendChild(this.docFrag);
                    }
                }
            },
            createFragment: function (options) {
                var fragment = new DomFragment(options);
                if (this.docFrag) {
                    this.docFrag.appendChild(fragment.docFrag);
                }
                return fragment;
            },
            toString: function () {
                var str, i, len;
                str = '';
                i = 0;
                len = this.length;
                for (i = 0; i < len; i += 1) {
                    str += this.fragments[i].toString();
                }
                return str;
            }
        };
        return DomSection;
    }(config_types, shared_initMustache, shared_updateMustache, shared_resolveMustache, shared_updateSection, shared_reassignFragments, shared_teardown);
var DomFragment_Triple = function (types, initMustache, updateMustache, resolveMustache, insertHtml, teardown) {
        
        var DomTriple = function (options, docFrag) {
            this.type = types.TRIPLE;
            if (docFrag) {
                this.nodes = [];
                this.docFrag = document.createDocumentFragment();
            }
            this.initialising = true;
            initMustache(this, options);
            if (docFrag) {
                docFrag.appendChild(this.docFrag);
            }
            this.initialising = false;
        };
        DomTriple.prototype = {
            update: updateMustache,
            resolve: resolveMustache,
            teardown: function (detach) {
                var node;
                if (detach) {
                    while (this.nodes.length) {
                        node = this.nodes.pop();
                        node.parentNode.removeChild(node);
                    }
                }
                teardown(this);
            },
            firstNode: function () {
                if (this.nodes[0]) {
                    return this.nodes[0];
                }
                return this.parentFragment.findNextNode(this);
            },
            render: function (html) {
                var node;
                if (!this.nodes) {
                    return;
                }
                while (this.nodes.length) {
                    node = this.nodes.pop();
                    node.parentNode.removeChild(node);
                }
                if (html === undefined) {
                    this.nodes = [];
                    return;
                }
                this.nodes = insertHtml(html, this.parentNode.tagName, this.docFrag);
                if (!this.initialising) {
                    this.parentNode.insertBefore(this.docFrag, this.parentFragment.findNextNode(this));
                }
            },
            toString: function () {
                return this.value !== undefined ? this.value : '';
            }
        };
        return DomTriple;
    }(config_types, shared_initMustache, shared_updateMustache, shared_resolveMustache, shared_insertHtml, shared_teardown);
var config_voidElementNames = function () {
        
        return 'area base br col command doctype embed hr img input keygen link meta param source track wbr'.split(' ');
    }();
var config_namespaces = {
        html: 'http://www.w3.org/1999/xhtml',
        mathml: 'http://www.w3.org/1998/Math/MathML',
        svg: 'http://www.w3.org/2000/svg',
        xlink: 'http://www.w3.org/1999/xlink',
        xml: 'http://www.w3.org/XML/1998/namespace',
        xmlns: 'http://www.w3.org/2000/xmlns/'
    };
var Element_getElementNamespace = function (namespaces) {
        
        return function (descriptor, parentNode) {
            if (descriptor.a && descriptor.a.xmlns) {
                return descriptor.a.xmlns;
            }
            return descriptor.e.toLowerCase() === 'svg' ? namespaces.svg : parentNode.namespaceURI;
        };
    }(config_namespaces);
var Attribute_bindAttribute = function (types, warn, arrayContentsMatch, isNumeric, getValueFromCheckboxes) {
        
        var bindAttribute, getInterpolator, updateModel, getBinding, inheritProperties, MultipleSelectBinding, SelectBinding, RadioNameBinding, CheckboxNameBinding, CheckedBinding, FileListBinding, GenericBinding;
        bindAttribute = function () {
            var node = this.parentNode, interpolator, binding, bindings;
            if (!this.fragment) {
                return false;
            }
            interpolator = getInterpolator(this);
            if (!interpolator) {
                return false;
            }
            this.interpolator = interpolator;
            this.keypath = interpolator.keypath || interpolator.descriptor.r;
            binding = getBinding(this);
            if (!binding) {
                return false;
            }
            node._ractive.binding = binding;
            this.twoway = true;
            bindings = this.root._twowayBindings[this.keypath] || (this.root._twowayBindings[this.keypath] = []);
            bindings[bindings.length] = binding;
            return true;
        };
        updateModel = function () {
            this._ractive.binding.update();
        };
        getInterpolator = function (attribute) {
            var item;
            if (attribute.fragment.items.length !== 1) {
                return null;
            }
            item = attribute.fragment.items[0];
            if (item.type !== types.INTERPOLATOR) {
                return null;
            }
            if (!item.keypath && !item.ref) {
                return null;
            }
            return item;
        };
        getBinding = function (attribute) {
            var node = attribute.parentNode;
            if (node.tagName === 'SELECT') {
                return node.multiple ? new MultipleSelectBinding(attribute, node) : new SelectBinding(attribute, node);
            }
            if (node.type === 'checkbox' || node.type === 'radio') {
                if (attribute.propertyName === 'name') {
                    if (node.type === 'checkbox') {
                        return new CheckboxNameBinding(attribute, node);
                    }
                    if (node.type === 'radio') {
                        return new RadioNameBinding(attribute, node);
                    }
                }
                if (attribute.propertyName === 'checked') {
                    return new CheckedBinding(attribute, node);
                }
                return null;
            }
            if (attribute.propertyName !== 'value') {
                warn('This is... odd');
            }
            if (attribute.parentNode.type === 'file') {
                return new FileListBinding(attribute, node);
            }
            return new GenericBinding(attribute, node);
        };
        MultipleSelectBinding = function (attribute, node) {
            var valueFromModel;
            inheritProperties(this, attribute, node);
            node.addEventListener('change', updateModel, false);
            valueFromModel = this.root.get(this.keypath);
            if (valueFromModel === undefined) {
                this.update();
            }
        };
        MultipleSelectBinding.prototype = {
            value: function () {
                var value, options, i, len;
                value = [];
                options = this.node.options;
                len = options.length;
                for (i = 0; i < len; i += 1) {
                    if (options[i].selected) {
                        value[value.length] = options[i]._ractive.value;
                    }
                }
                return value;
            },
            update: function () {
                var attribute, previousValue, value;
                attribute = this.attr;
                previousValue = attribute.value;
                value = this.value();
                if (previousValue === undefined || !arrayContentsMatch(value, previousValue)) {
                    attribute.receiving = true;
                    attribute.value = value;
                    this.root.set(this.keypath, value);
                    attribute.receiving = false;
                }
            },
            teardown: function () {
                this.node.removeEventListener('change', updateModel, false);
            }
        };
        SelectBinding = function (attribute, node) {
            var valueFromModel;
            inheritProperties(this, attribute, node);
            node.addEventListener('change', updateModel, false);
            valueFromModel = this.root.get(this.keypath);
            if (valueFromModel === undefined) {
                this.update();
            }
        };
        SelectBinding.prototype = {
            value: function () {
                var options, i, len;
                options = this.node.options;
                len = options.length;
                for (i = 0; i < len; i += 1) {
                    if (options[i].selected) {
                        return options[i]._ractive.value;
                    }
                }
            },
            update: function () {
                var value = this.value();
                if (isNumeric(value)) {
                    value = +value;
                }
                this.attr.receiving = true;
                this.attr.value = value;
                this.root.set(this.keypath, value);
                this.attr.receiving = false;
            },
            teardown: function () {
                this.node.removeEventListener('change', updateModel, false);
            }
        };
        RadioNameBinding = function (attribute, node) {
            var valueFromModel;
            this.radioName = true;
            inheritProperties(this, attribute, node);
            node.name = '{{' + attribute.keypath + '}}';
            node.addEventListener('change', updateModel, false);
            if (node.attachEvent) {
                node.addEventListener('click', updateModel, false);
            }
            valueFromModel = this.root.get(this.keypath);
            if (valueFromModel !== undefined) {
                node.checked = valueFromModel === node._ractive.value;
            } else {
                this.root._defRadios[this.root._defRadios.length] = this;
            }
        };
        RadioNameBinding.prototype = {
            value: function () {
                return this.node._ractive ? this.node._ractive.value : this.node.value;
            },
            update: function () {
                var node = this.node;
                if (node.checked) {
                    this.attr.receiving = true;
                    this.root.set(this.keypath, this.value());
                    this.attr.receiving = false;
                }
            },
            teardown: function () {
                this.node.removeEventListener('change', updateModel, false);
                this.node.removeEventListener('click', updateModel, false);
            }
        };
        CheckboxNameBinding = function (attribute, node) {
            var valueFromModel, checked;
            this.checkboxName = true;
            inheritProperties(this, attribute, node);
            node.name = '{{' + this.keypath + '}}';
            node.addEventListener('change', updateModel, false);
            if (node.attachEvent) {
                node.addEventListener('click', updateModel, false);
            }
            valueFromModel = this.root.get(this.keypath);
            if (valueFromModel !== undefined) {
                checked = valueFromModel.indexOf(node._ractive.value) !== -1;
                node.checked = checked;
            } else {
                if (this.root._defCheckboxes.indexOf(this.keypath) === -1) {
                    this.root._defCheckboxes[this.root._defCheckboxes.length] = this.keypath;
                }
            }
        };
        CheckboxNameBinding.prototype = {
            changed: function () {
                return this.node.checked !== !!this.checked;
            },
            update: function () {
                this.checked = this.node.checked;
                this.attr.receiving = true;
                this.root.set(this.keypath, getValueFromCheckboxes(this.root, this.keypath));
                this.attr.receiving = false;
            },
            teardown: function () {
                this.node.removeEventListener('change', updateModel, false);
                this.node.removeEventListener('click', updateModel, false);
            }
        };
        CheckedBinding = function (attribute, node) {
            inheritProperties(this, attribute, node);
            node.addEventListener('change', updateModel, false);
            if (node.attachEvent) {
                node.addEventListener('click', updateModel, false);
            }
        };
        CheckedBinding.prototype = {
            value: function () {
                return this.node.checked;
            },
            update: function () {
                this.attr.receiving = true;
                this.root.set(this.keypath, this.value());
                this.attr.receiving = false;
            },
            teardown: function () {
                this.node.removeEventListener('change', updateModel, false);
                this.node.removeEventListener('click', updateModel, false);
            }
        };
        FileListBinding = function (attribute, node) {
            inheritProperties(this, attribute, node);
            node.addEventListener('change', updateModel, false);
        };
        FileListBinding.prototype = {
            value: function () {
                return this.attr.parentNode.files;
            },
            update: function () {
                this.attr.root.set(this.attr.keypath, this.value());
            },
            teardown: function () {
                this.node.removeEventListener('change', updateModel, false);
            }
        };
        GenericBinding = function (attribute, node) {
            inheritProperties(this, attribute, node);
            node.addEventListener('change', updateModel, false);
            if (!this.root.lazy) {
                node.addEventListener('input', updateModel, false);
                if (node.attachEvent) {
                    node.addEventListener('keyup', updateModel, false);
                }
            }
        };
        GenericBinding.prototype = {
            value: function () {
                var value = this.attr.parentNode.value;
                if (+value + '' === value && value.indexOf('e') === -1) {
                    value = +value;
                }
                return value;
            },
            update: function () {
                var attribute = this.attr, value = this.value();
                attribute.receiving = true;
                attribute.root.set(attribute.keypath, value);
                attribute.receiving = false;
            },
            teardown: function () {
                this.node.removeEventListener('change', updateModel, false);
                this.node.removeEventListener('input', updateModel, false);
                this.node.removeEventListener('keyup', updateModel, false);
            }
        };
        inheritProperties = function (binding, attribute, node) {
            binding.attr = attribute;
            binding.node = node;
            binding.root = attribute.root;
            binding.keypath = attribute.keypath;
        };
        return bindAttribute;
    }(config_types, utils_warn, utils_arrayContentsMatch, utils_isNumeric, shared_getValueFromCheckboxes);
var Attribute_updateAttribute = function (isArray) {
        
        var updateAttribute, updateFileInputValue, deferSelect, initSelect, updateSelect, updateMultipleSelect, updateRadioName, updateCheckboxName, updateIEStyleAttribute, updateClassName, updateEverythingElse;
        updateAttribute = function () {
            var node;
            if (!this.ready) {
                return this;
            }
            node = this.parentNode;
            if (node.tagName === 'SELECT' && this.name === 'value') {
                this.update = deferSelect;
                this.deferredUpdate = initSelect;
                return this.update();
            }
            if (this.isFileInputValue) {
                this.update = updateFileInputValue;
                return this;
            }
            if (this.twoway && this.name === 'name') {
                if (node.type === 'radio') {
                    this.update = updateRadioName;
                    return this.update();
                }
                if (node.type === 'checkbox') {
                    this.update = updateCheckboxName;
                    return this.update();
                }
            }
            if (this.name === 'style' && node.style.setAttribute) {
                this.update = updateIEStyleAttribute;
                return this.update();
            }
            if (this.name === 'class') {
                this.update = updateClassName;
                return this.update();
            }
            this.update = updateEverythingElse;
            return this.update();
        };
        updateFileInputValue = function () {
            return this;
        };
        initSelect = function () {
            this.deferredUpdate = this.parentNode.multiple ? updateMultipleSelect : updateSelect;
            this.deferredUpdate();
        };
        deferSelect = function () {
            this.root._defSelectValues.push(this);
            return this;
        };
        updateSelect = function () {
            var value = this.fragment.getValue(), options, option, i;
            this.value = this.parentNode._ractive.value = value;
            options = this.parentNode.options;
            i = options.length;
            while (i--) {
                option = options[i];
                if (option._ractive.value == value) {
                    option.selected = true;
                    return this;
                }
            }
            return this;
        };
        updateMultipleSelect = function () {
            var value = this.fragment.getValue(), options, i;
            if (!isArray(value)) {
                value = [value];
            }
            options = this.parentNode.options;
            i = options.length;
            while (i--) {
                options[i].selected = value.indexOf(options[i]._ractive.value) !== -1;
            }
            this.value = value;
            return this;
        };
        updateRadioName = function () {
            var node, value;
            node = this.parentNode;
            value = this.fragment.getValue();
            node.checked = value === node._ractive.value;
            return this;
        };
        updateCheckboxName = function () {
            var node, value;
            node = this.parentNode;
            value = this.fragment.getValue();
            if (!isArray(value)) {
                node.checked = value === node._ractive.value;
                return this;
            }
            node.checked = value.indexOf(node._ractive.value) !== -1;
            return this;
        };
        updateIEStyleAttribute = function () {
            var node, value;
            node = this.parentNode;
            value = this.fragment.getValue();
            if (value === undefined) {
                value = '';
            }
            if (value !== this.value) {
                node.style.setAttribute('cssText', value);
                this.value = value;
            }
            return this;
        };
        updateClassName = function () {
            var node, value;
            node = this.parentNode;
            value = this.fragment.getValue();
            if (value === undefined) {
                value = '';
            }
            if (value !== this.value) {
                node.className = value;
                this.value = value;
            }
            return this;
        };
        updateEverythingElse = function () {
            var node, value;
            node = this.parentNode;
            value = this.fragment.getValue();
            if (this.isValueAttribute) {
                node._ractive.value = value;
            }
            if (value === undefined) {
                value = '';
            }
            if (value !== this.value) {
                if (this.useProperty) {
                    if (!this.receiving) {
                        node[this.propertyName] = value;
                    }
                    this.value = value;
                    return this;
                }
                if (this.namespace) {
                    node.setAttributeNS(this.namespace, this.name, value);
                    this.value = value;
                    return this;
                }
                if (this.name === 'id') {
                    if (this.value !== undefined) {
                        this.root.nodes[this.value] = undefined;
                    }
                    this.root.nodes[value] = node;
                }
                node.setAttribute(this.name, value);
                this.value = value;
            }
            return this;
        };
        return updateAttribute;
    }(utils_isArray);
var StringFragment_Interpolator = function (types, teardown, initMustache, updateMustache, resolveMustache) {
        
        var StringInterpolator = function (options) {
            this.type = types.INTERPOLATOR;
            initMustache(this, options);
        };
        StringInterpolator.prototype = {
            update: updateMustache,
            resolve: resolveMustache,
            render: function (value) {
                this.value = value;
                this.parentFragment.bubble();
            },
            teardown: function () {
                teardown(this);
            },
            toString: function () {
                if (this.value === undefined) {
                    return '';
                }
                if (this.value === null) {
                    return 'null';
                }
                return this.value.toString();
            }
        };
        return StringInterpolator;
    }(config_types, shared_teardown, shared_initMustache, shared_updateMustache, shared_resolveMustache);
var StringFragment_Section = function (types, initMustache, updateMustache, resolveMustache, updateSection, teardown) {
        
        var StringSection, StringFragment;
        loadCircularDependency(function () {
            (function (dep) {
                StringFragment = dep;
            }(StringFragment__index));
        });
        StringSection = function (options) {
            this.type = types.SECTION;
            this.fragments = [];
            this.length = 0;
            initMustache(this, options);
        };
        StringSection.prototype = {
            update: updateMustache,
            resolve: resolveMustache,
            teardown: function () {
                this.teardownFragments();
                teardown(this);
            },
            teardownFragments: function () {
                while (this.fragments.length) {
                    this.fragments.shift().teardown();
                }
                this.length = 0;
            },
            bubble: function () {
                this.value = this.fragments.join('');
                this.parentFragment.bubble();
            },
            render: function (value) {
                var wrapped;
                if (wrapped = this.root._wrapped[this.keypath]) {
                    value = wrapped.get();
                }
                updateSection(this, value);
                this.parentFragment.bubble();
            },
            createFragment: function (options) {
                return new StringFragment(options);
            },
            toString: function () {
                return this.fragments.join('');
            }
        };
        return StringSection;
    }(config_types, shared_initMustache, shared_updateMustache, shared_resolveMustache, shared_updateSection, shared_teardown);
var StringFragment_Text = function (types) {
        
        var StringText = function (text) {
            this.type = types.TEXT;
            this.text = text;
        };
        StringText.prototype = {
            toString: function () {
                return this.text;
            },
            teardown: function () {
            }
        };
        return StringText;
    }(config_types);
var StringFragment__index = function (types, initFragment, Interpolator, Section, Text) {
        
        var StringFragment = function (options) {
            initFragment(this, options);
        };
        StringFragment.prototype = {
            createItem: function (options) {
                if (typeof options.descriptor === 'string') {
                    return new Text(options.descriptor);
                }
                switch (options.descriptor.t) {
                case types.INTERPOLATOR:
                    return new Interpolator(options);
                case types.TRIPLE:
                    return new Interpolator(options);
                case types.SECTION:
                    return new Section(options);
                default:
                    throw 'Something went wrong in a rather interesting way';
                }
            },
            bubble: function () {
                this.owner.bubble();
            },
            teardown: function () {
                var numItems, i;
                numItems = this.items.length;
                for (i = 0; i < numItems; i += 1) {
                    this.items[i].teardown();
                }
            },
            getValue: function () {
                var value;
                if (this.items.length === 1 && this.items[0].type === types.INTERPOLATOR) {
                    value = this.items[0].value;
                    if (value !== undefined) {
                        return value;
                    }
                }
                return this.toString();
            },
            isSimple: function () {
                var i, item, containsInterpolator;
                if (this.simple !== undefined) {
                    return this.simple;
                }
                i = this.items.length;
                while (i--) {
                    item = this.items[i];
                    if (item.type === types.TEXT) {
                        continue;
                    }
                    if (item.type === types.INTERPOLATOR) {
                        if (containsInterpolator) {
                            return false;
                        } else {
                            containsInterpolator = true;
                            continue;
                        }
                    }
                    return this.simple = false;
                }
                return this.simple = true;
            },
            toString: function () {
                return this.items.join('');
            },
            toJSON: function () {
                var value = this.getValue();
                if (typeof value === 'string') {
                    try {
                        value = JSON.parse(value);
                    } catch (err) {
                    }
                }
                return value;
            }
        };
        return StringFragment;
    }(config_types, shared_initFragment, StringFragment_Interpolator, StringFragment_Section, StringFragment_Text);
var Attribute_index = function (namespaces, bindAttribute, updateAttribute, StringFragment) {
        
        var DomAttribute, propertyNames, determineNameAndNamespace, setStaticAttribute, determinePropertyName;
        propertyNames = {
            'accept-charset': 'acceptCharset',
            accesskey: 'accessKey',
            bgcolor: 'bgColor',
            'class': 'className',
            codebase: 'codeBase',
            colspan: 'colSpan',
            contenteditable: 'contentEditable',
            datetime: 'dateTime',
            dirname: 'dirName',
            'for': 'htmlFor',
            'http-equiv': 'httpEquiv',
            ismap: 'isMap',
            maxlength: 'maxLength',
            novalidate: 'noValidate',
            pubdate: 'pubDate',
            readonly: 'readOnly',
            rowspan: 'rowSpan',
            tabindex: 'tabIndex',
            usemap: 'useMap'
        };
        DomAttribute = function (options) {
            this.element = options.element;
            determineNameAndNamespace(this, options.name);
            if (options.value === null || typeof options.value === 'string') {
                setStaticAttribute(this, options);
                return;
            }
            this.root = options.root;
            this.parentNode = options.parentNode;
            this.parentFragment = this.element.parentFragment;
            this.fragment = new StringFragment({
                descriptor: options.value,
                root: this.root,
                owner: this,
                contextStack: options.contextStack
            });
            if (!this.parentNode) {
                return;
            }
            if (this.name === 'value') {
                options.element.ractify();
                this.isValueAttribute = true;
                if (this.parentNode.tagName === 'INPUT' && this.parentNode.type === 'file') {
                    this.isFileInputValue = true;
                }
            }
            determinePropertyName(this, options);
            this.selfUpdating = this.fragment.isSimple();
            this.ready = true;
        };
        DomAttribute.prototype = {
            bind: bindAttribute,
            update: updateAttribute,
            updateBindings: function () {
                this.keypath = this.interpolator.keypath || this.interpolator.r;
                if (this.propertyName === 'name') {
                    this.parentNode.name = '{{' + this.keypath + '}}';
                }
            },
            teardown: function () {
                var i;
                if (this.boundEvents) {
                    i = this.boundEvents.length;
                    while (i--) {
                        this.parentNode.removeEventListener(this.boundEvents[i], this.updateModel, false);
                    }
                }
                if (this.fragment) {
                    this.fragment.teardown();
                }
            },
            bubble: function () {
                if (this.selfUpdating) {
                    this.update();
                } else if (!this.deferred && this.ready) {
                    this.root._defAttrs[this.root._defAttrs.length] = this;
                    this.deferred = true;
                }
            },
            toString: function () {
                var str;
                if (this.value === null) {
                    return this.name;
                }
                if (!this.fragment) {
                    return this.name + '=' + JSON.stringify(this.value);
                }
                str = this.fragment.toString();
                return this.name + '=' + JSON.stringify(str);
            }
        };
        determineNameAndNamespace = function (attribute, name) {
            var colonIndex, namespacePrefix;
            colonIndex = name.indexOf(':');
            if (colonIndex !== -1) {
                namespacePrefix = name.substr(0, colonIndex);
                if (namespacePrefix !== 'xmlns') {
                    name = name.substring(colonIndex + 1);
                    attribute.name = name;
                    attribute.namespace = namespaces[namespacePrefix];
                    if (!attribute.namespace) {
                        throw 'Unknown namespace ("' + namespacePrefix + '")';
                    }
                    return;
                }
            }
            attribute.name = name;
        };
        setStaticAttribute = function (attribute, options) {
            var value = options.value === null ? '' : options.value;
            if (options.parentNode) {
                if (attribute.namespace) {
                    options.parentNode.setAttributeNS(attribute.namespace, options.name, value);
                } else {
                    if (options.name === 'style' && options.parentNode.style.setAttribute) {
                        options.parentNode.style.setAttribute('cssText', value);
                    } else if (options.name === 'class') {
                        options.parentNode.className = value;
                    } else {
                        options.parentNode.setAttribute(options.name, value);
                    }
                }
                if (attribute.name === 'id') {
                    options.root.nodes[options.value] = options.parentNode;
                }
                if (attribute.name === 'value') {
                    attribute.element.ractify().value = options.value;
                }
            }
            attribute.value = options.value;
        };
        determinePropertyName = function (attribute, options) {
            var propertyName;
            if (attribute.parentNode && !attribute.namespace && (!options.parentNode.namespaceURI || options.parentNode.namespaceURI === namespaces.html)) {
                propertyName = propertyNames[attribute.name] || attribute.name;
                if (options.parentNode[propertyName] !== undefined) {
                    attribute.propertyName = propertyName;
                }
                if (typeof options.parentNode[propertyName] === 'boolean' || propertyName === 'value') {
                    attribute.useProperty = true;
                }
            }
        };
        return DomAttribute;
    }(config_namespaces, Attribute_bindAttribute, Attribute_updateAttribute, StringFragment__index);
var Element_createElementAttributes = function (DomAttribute) {
        
        return function (element, attributes) {
            var attrName, attrValue, attr;
            element.attributes = [];
            for (attrName in attributes) {
                if (attributes.hasOwnProperty(attrName)) {
                    attrValue = attributes[attrName];
                    attr = new DomAttribute({
                        element: element,
                        name: attrName,
                        value: attrValue,
                        root: element.root,
                        parentNode: element.node,
                        contextStack: element.parentFragment.contextStack
                    });
                    element.attributes[element.attributes.length] = element.attributes[attrName] = attr;
                    if (attrName !== 'name') {
                        attr.update();
                    }
                }
            }
            return element.attributes;
        };
    }(Attribute_index);
var Element_appendElementChildren = function (namespaces, StringFragment) {
        
        var DomFragment;
        loadCircularDependency(function () {
            (function (dep) {
                DomFragment = dep;
            }(DomFragment__index));
        });
        return function (element, node, descriptor, docFrag) {
            if (typeof descriptor.f === 'string' && (!node || (!node.namespaceURI || node.namespaceURI === namespaces.html))) {
                element.html = descriptor.f;
                if (docFrag) {
                    node.innerHTML = element.html;
                }
            } else {
                if (descriptor.e === 'style' && node.styleSheet !== undefined) {
                    element.fragment = new StringFragment({
                        descriptor: descriptor.f,
                        root: element.root,
                        contextStack: element.parentFragment.contextStack,
                        owner: element
                    });
                    if (docFrag) {
                        element.bubble = function () {
                            node.styleSheet.cssText = element.fragment.toString();
                        };
                    }
                } else {
                    element.fragment = new DomFragment({
                        descriptor: descriptor.f,
                        root: element.root,
                        parentNode: node,
                        contextStack: element.parentFragment.contextStack,
                        owner: element
                    });
                    if (docFrag) {
                        node.appendChild(element.fragment.docFrag);
                    }
                }
            }
        };
    }(config_namespaces, StringFragment__index);
var Element_bindElement = function () {
        
        return function (element, attributes) {
            element.ractify();
            switch (element.descriptor.e) {
            case 'select':
            case 'textarea':
                if (attributes.value) {
                    attributes.value.bind();
                }
                return;
            case 'input':
                if (element.node.type === 'radio' || element.node.type === 'checkbox') {
                    if (attributes.name && attributes.name.bind()) {
                        return;
                    }
                    if (attributes.checked && attributes.checked.bind()) {
                        return;
                    }
                }
                if (attributes.value && attributes.value.bind()) {
                    return;
                }
            }
        };
    }();
var Element_Transition = function (isClient, isNumeric, isArray, StringFragment) {
        
        var Transition, parseTransitionParams, testStyle, vendors, vendorPattern, prefix, prefixCache, hyphenate, CSS_TRANSITIONS_ENABLED, TRANSITION, TRANSITION_DURATION, TRANSITION_PROPERTY, TRANSITION_TIMING_FUNCTION, TRANSITIONEND;
        if (!isClient) {
            return;
        }
        testStyle = document.createElement('div').style;
        (function () {
            if (testStyle.transition !== undefined) {
                TRANSITION = 'transition';
                TRANSITIONEND = 'transitionend';
                CSS_TRANSITIONS_ENABLED = true;
            } else if (testStyle.webkitTransition !== undefined) {
                TRANSITION = 'webkitTransition';
                TRANSITIONEND = 'webkitTransitionEnd';
                CSS_TRANSITIONS_ENABLED = true;
            } else {
                CSS_TRANSITIONS_ENABLED = false;
            }
        }());
        if (TRANSITION) {
            TRANSITION_DURATION = TRANSITION + 'Duration';
            TRANSITION_PROPERTY = TRANSITION + 'Property';
            TRANSITION_TIMING_FUNCTION = TRANSITION + 'TimingFunction';
        }
        Transition = function (descriptor, root, owner, contextStack, isIntro) {
            var fragment, params, prop;
            this.root = root;
            this.node = owner.node;
            this.isIntro = isIntro;
            this.originalStyle = this.node.getAttribute('style');
            if (typeof descriptor === 'string') {
                this.name = descriptor;
            } else {
                this.name = descriptor.n;
                if (descriptor.a) {
                    params = descriptor.a;
                } else if (descriptor.d) {
                    fragment = new StringFragment({
                        descriptor: descriptor.d,
                        root: root,
                        owner: owner,
                        contextStack: owner.parentFragment.contextStack
                    });
                    params = fragment.toJSON();
                    fragment.teardown();
                }
            }
            this._fn = root.transitions[this.name];
            if (!this._fn) {
                return;
            }
            params = parseTransitionParams(params);
            for (prop in params) {
                if (params.hasOwnProperty(prop)) {
                    this[prop] = params[prop];
                }
            }
        };
        Transition.prototype = {
            init: function () {
                if (this._inited) {
                    throw new Error('Cannot initialize a transition more than once');
                }
                this._inited = true;
                this._fn.call(this.root, this);
            },
            complete: function () {
                this._manager.pop(this.node);
                this.node._ractive.transition = null;
            },
            getStyle: function (props) {
                var computedStyle, styles, i, prop, value;
                computedStyle = window.getComputedStyle(this.node);
                if (typeof props === 'string') {
                    value = computedStyle[prefix(props)];
                    if (value === '0px') {
                        value = 0;
                    }
                    return value;
                }
                if (!isArray(props)) {
                    throw new Error('Transition#getStyle must be passed a string, or an array of strings representing CSS properties');
                }
                styles = {};
                i = props.length;
                while (i--) {
                    prop = props[i];
                    value = computedStyle[prefix(prop)];
                    if (value === '0px') {
                        value = 0;
                    }
                    styles[prop] = value;
                }
                return styles;
            },
            setStyle: function (style, value) {
                var prop;
                if (typeof style === 'string') {
                    this.node.style[prefix(style)] = value;
                } else {
                    for (prop in style) {
                        if (style.hasOwnProperty(prop)) {
                            this.node.style[prefix(prop)] = style[prop];
                        }
                    }
                }
                return this;
            },
            animateStyle: function (to) {
                var t = this, propertyNames, changedProperties, computedStyle, current, from, transitionEndHandler, i, prop;
                propertyNames = Object.keys(to);
                changedProperties = [];
                computedStyle = window.getComputedStyle(t.node);
                from = {};
                i = propertyNames.length;
                while (i--) {
                    prop = propertyNames[i];
                    current = computedStyle[prefix(prop)];
                    if (current === '0px') {
                        current = 0;
                    }
                    if (current != to[prop]) {
                        changedProperties[changedProperties.length] = prop;
                        t.node.style[prefix(prop)] = current;
                    }
                }
                if (!changedProperties.length) {
                    t.resetStyle();
                    t.complete();
                    return;
                }
                setTimeout(function () {
                    t.node.style[TRANSITION_PROPERTY] = propertyNames.map(prefix).map(hyphenate).join(',');
                    t.node.style[TRANSITION_TIMING_FUNCTION] = hyphenate(t.easing || 'linear');
                    t.node.style[TRANSITION_DURATION] = t.duration / 1000 + 's';
                    transitionEndHandler = function () {
                        t.node.removeEventListener(TRANSITIONEND, transitionEndHandler, false);
                        if (t.isIntro) {
                            t.resetStyle();
                        }
                        t.complete();
                    };
                    t.node.addEventListener(TRANSITIONEND, transitionEndHandler, false);
                    setTimeout(function () {
                        var i = changedProperties.length;
                        while (i--) {
                            prop = changedProperties[i];
                            t.node.style[prefix(prop)] = to[prop];
                        }
                    }, 0);
                }, t.delay || 0);
            },
            resetStyle: function () {
                if (this.originalStyle) {
                    this.node.setAttribute('style', this.originalStyle);
                } else {
                    this.node.getAttribute('style');
                    this.node.removeAttribute('style');
                }
            }
        };
        parseTransitionParams = function (params) {
            if (params === 'fast') {
                return { duration: 200 };
            }
            if (params === 'slow') {
                return { duration: 600 };
            }
            if (isNumeric(params)) {
                return { duration: +params };
            }
            return params || {};
        };
        vendors = [
            'o',
            'ms',
            'moz',
            'webkit'
        ];
        vendorPattern = new RegExp('^(?:' + vendors.join('|') + ')[A-Z]');
        prefixCache = {};
        prefix = function (prop) {
            var i, vendor, capped;
            if (!prefixCache[prop]) {
                if (testStyle[prop] !== undefined) {
                    prefixCache[prop] = prop;
                } else {
                    capped = prop.charAt(0).toUpperCase() + prop.substring(1);
                    i = vendors.length;
                    while (i--) {
                        vendor = vendors[i];
                        if (testStyle[vendor + capped] !== undefined) {
                            prefixCache[prop] = vendor + capped;
                            break;
                        }
                    }
                }
            }
            return prefixCache[prop];
        };
        hyphenate = function (str) {
            var hyphenated;
            if (vendorPattern.test(str)) {
                str = '-' + str;
            }
            hyphenated = str.replace(/[A-Z]/g, function (match) {
                return '-' + match.toLowerCase();
            });
            return hyphenated;
        };
        return Transition;
    }(config_isClient, utils_isNumeric, utils_isArray, StringFragment__index);
var Element_executeTransition = function (isClient, warn, Transition) {
        
        if (!isClient) {
            return;
        }
        return function (descriptor, root, owner, contextStack, isIntro) {
            var transition, node, oldTransition;
            if (!root.transitionsEnabled) {
                return;
            }
            transition = new Transition(descriptor, root, owner, contextStack, isIntro);
            if (transition._fn) {
                if (transition._fn.length !== 1) {
                    warn('The transitions API has changed. See https://github.com/Rich-Harris/Ractive/wiki/Transitions for details');
                }
                node = transition.node;
                transition._manager = root._transitionManager;
                if (oldTransition = node._ractive.transition) {
                    oldTransition.complete();
                }
                node._ractive.transition = transition;
                transition._manager.push(node);
                if (isIntro) {
                    root._defTransitions.push(transition);
                } else {
                    transition.init();
                }
            }
        };
    }(config_isClient, utils_warn, Element_Transition);
var Element_addEventProxy = function (StringFragment) {
        
        var addEventProxy, MasterEventHandler, ProxyEvent, firePlainEvent, fireEventWithArgs, fireEventWithDynamicArgs, customHandlers, genericHandler, getCustomHandler;
        addEventProxy = function (element, triggerEventName, proxyDescriptor, contextStack, indexRefs) {
            var events, master;
            events = element.ractify().events;
            master = events[triggerEventName] || (events[triggerEventName] = new MasterEventHandler(element, triggerEventName, contextStack, indexRefs));
            master.add(proxyDescriptor);
        };
        MasterEventHandler = function (element, eventName, contextStack) {
            var definition;
            this.element = element;
            this.root = element.root;
            this.node = element.node;
            this.name = eventName;
            this.contextStack = contextStack;
            this.proxies = [];
            if (definition = this.root.events[eventName]) {
                this.custom = definition(this.node, getCustomHandler(eventName));
            } else {
                this.node.addEventListener(eventName, genericHandler, false);
            }
        };
        MasterEventHandler.prototype = {
            add: function (proxy) {
                this.proxies[this.proxies.length] = new ProxyEvent(this.element, this.root, proxy, this.contextStack);
            },
            teardown: function () {
                var i;
                if (this.custom) {
                    this.custom.teardown();
                } else {
                    this.node.removeEventListener(this.name, genericHandler, false);
                }
                i = this.proxies.length;
                while (i--) {
                    this.proxies[i].teardown();
                }
            },
            fire: function (event) {
                var i = this.proxies.length;
                while (i--) {
                    this.proxies[i].fire(event);
                }
            }
        };
        ProxyEvent = function (element, ractive, descriptor, contextStack) {
            var name;
            this.root = ractive;
            name = descriptor.n || descriptor;
            if (typeof name === 'string') {
                this.n = name;
            } else {
                this.n = new StringFragment({
                    descriptor: descriptor.n,
                    root: this.root,
                    owner: element,
                    contextStack: contextStack
                });
            }
            if (descriptor.a) {
                this.a = descriptor.a;
                this.fire = fireEventWithArgs;
                return;
            }
            if (descriptor.d) {
                this.d = new StringFragment({
                    descriptor: descriptor.d,
                    root: this.root,
                    owner: element,
                    contextStack: contextStack
                });
                this.fire = fireEventWithDynamicArgs;
                return;
            }
            this.fire = firePlainEvent;
        };
        ProxyEvent.prototype = {
            teardown: function () {
                if (this.n.teardown) {
                    this.n.teardown();
                }
                if (this.d) {
                    this.d.teardown();
                }
            },
            bubble: function () {
            }
        };
        firePlainEvent = function (event) {
            this.root.fire(this.n.toString(), event);
        };
        fireEventWithArgs = function (event) {
            this.root.fire(this.n.toString(), event, this.a);
        };
        fireEventWithDynamicArgs = function (event) {
            this.root.fire(this.n.toString(), event, this.d.toJSON());
        };
        genericHandler = function (event) {
            var storage = this._ractive;
            storage.events[event.type].fire({
                node: this,
                original: event,
                index: storage.index,
                keypath: storage.keypath,
                context: storage.root.get(storage.keypath)
            });
        };
        customHandlers = {};
        getCustomHandler = function (eventName) {
            if (customHandlers[eventName]) {
                return customHandlers[eventName];
            }
            return customHandlers[eventName] = function (event) {
                var storage = event.node._ractive;
                event.index = storage.index;
                event.keypath = storage.keypath;
                event.context = storage.root.get(storage.keypath);
                storage.events[eventName].fire(event);
            };
        };
        return addEventProxy;
    }(StringFragment__index);
var Element_addEventProxies = function (addEventProxy) {
        
        return function (element, proxies) {
            var i, eventName, eventNames;
            for (eventName in proxies) {
                if (proxies.hasOwnProperty(eventName)) {
                    eventNames = eventName.split('-');
                    i = eventNames.length;
                    while (i--) {
                        addEventProxy(element, eventNames[i], proxies[eventName], element.parentFragment.contextStack);
                    }
                }
            }
        };
    }(Element_addEventProxy);
var Element__index = function (types, create, defineProperty, voidElementNames, warn, getElementNamespace, createElementAttributes, appendElementChildren, bindElement, executeTransition, addEventProxies) {
        
        var DomElement = function (options, docFrag) {
            var self = this, parentFragment, descriptor, namespace, attributes, decoratorFn, errorMessage, width, height, loadHandler, root;
            this.type = types.ELEMENT;
            parentFragment = this.parentFragment = options.parentFragment;
            descriptor = this.descriptor = options.descriptor;
            this.root = root = parentFragment.root;
            this.parentNode = parentFragment.parentNode;
            this.index = options.index;
            this.eventListeners = [];
            this.customEventListeners = [];
            if (this.parentNode) {
                namespace = getElementNamespace(descriptor, this.parentNode);
                this.node = document.createElementNS(namespace, descriptor.e);
            }
            attributes = createElementAttributes(this, descriptor.a);
            if (descriptor.f) {
                appendElementChildren(this, this.node, descriptor, docFrag);
            }
            if (docFrag && descriptor.v) {
                addEventProxies(this, descriptor.v);
            }
            if (docFrag) {
                if (root.twoway) {
                    bindElement(this, attributes);
                }
                if (attributes.name && !attributes.name.twoway) {
                    attributes.name.update();
                }
                if (this.node.tagName === 'IMG' && ((width = self.attributes.width) || (height = self.attributes.height))) {
                    this.node.addEventListener('load', loadHandler = function () {
                        if (width) {
                            self.node.width = width.value;
                        }
                        if (height) {
                            self.node.height = height.value;
                        }
                        self.node.removeEventListener('load', loadHandler, false);
                    }, false);
                }
                docFrag.appendChild(this.node);
                if (descriptor.o) {
                    decoratorFn = this.root.decorators[descriptor.o];
                    if (decoratorFn) {
                        this.decorator = decoratorFn.call(this.root, this.node);
                        if (!this.decorator || !this.decorator.teardown) {
                            throw new Error('Decorator definition must return an object with a teardown method');
                        }
                    } else {
                        errorMessage = 'Missing decorator "' + descriptor.o + '"';
                        if (this.root.debug) {
                            throw new Error(errorMessage);
                        } else {
                            warn(errorMessage);
                        }
                    }
                }
                if (descriptor.t1) {
                    executeTransition(descriptor.t1, root, this, parentFragment.contextStack, true);
                }
                if (this.node.tagName === 'OPTION') {
                    if (this.node._ractive.value == this.parentNode._ractive.value) {
                        this.node.selected = true;
                    }
                }
            }
        };
        DomElement.prototype = {
            teardown: function (detach) {
                var eventName, binding, bindings;
                if (this.fragment) {
                    this.fragment.teardown(false);
                }
                while (this.attributes.length) {
                    this.attributes.pop().teardown();
                }
                if (this.node._ractive) {
                    for (eventName in this.node._ractive.events) {
                        this.node._ractive.events[eventName].teardown();
                    }
                    if (binding = this.node._ractive.binding) {
                        binding.teardown();
                        bindings = this.root._twowayBindings[binding.attr.keypath];
                        bindings.splice(bindings.indexOf(binding), 1);
                    }
                }
                if (this.decorator) {
                    this.decorator.teardown();
                }
                if (this.descriptor.t2) {
                    executeTransition(this.descriptor.t2, this.root, this, this.parentFragment.contextStack, false);
                }
                if (detach) {
                    this.root._transitionManager.detachWhenReady(this.node);
                }
            },
            firstNode: function () {
                return this.node;
            },
            findNextNode: function () {
                return null;
            },
            bubble: function () {
            },
            toString: function () {
                var str, i, len;
                str = '<' + (this.descriptor.y ? '!doctype' : this.descriptor.e);
                len = this.attributes.length;
                for (i = 0; i < len; i += 1) {
                    str += ' ' + this.attributes[i].toString();
                }
                str += '>';
                if (this.html) {
                    str += this.html;
                } else if (this.fragment) {
                    str += this.fragment.toString();
                }
                if (voidElementNames.indexOf(this.descriptor.e) === -1) {
                    str += '</' + this.descriptor.e + '>';
                }
                return str;
            },
            ractify: function () {
                var contextStack = this.parentFragment.contextStack;
                if (!this.node._ractive) {
                    defineProperty(this.node, '_ractive', {
                        value: {
                            keypath: contextStack.length ? contextStack[contextStack.length - 1] : '',
                            index: this.parentFragment.indexRefs,
                            events: create(null),
                            root: this.root
                        }
                    });
                }
                return this.node._ractive;
            }
        };
        return DomElement;
    }(config_types, utils_create, utils_defineProperty, config_voidElementNames, utils_warn, Element_getElementNamespace, Element_createElementAttributes, Element_appendElementChildren, Element_bindElement, Element_executeTransition, Element_addEventProxies);
var Partial_getPartialDescriptor = function (errors, warn, isClient, isObject, partials, parse) {
        
        var getPartialDescriptor, getPartialFromRegistry, unpack;
        getPartialDescriptor = function (root, name) {
            var el, partial;
            var document = document;
            if (partial = getPartialFromRegistry(root, name)) {
                return partial;
            }
            if (isClient && document) {
                el = document.getElementById(name);
                if (el && el.tagName === 'SCRIPT') {
                    if (!parse) {
                        throw new Error(errors.missingParser);
                    }
                    partials[name] = parse(el.innerHTML);
                }
            }
            partial = partials[name];
            if (!partial) {
                if (root.debug) {
                    warn('Could not find descriptor for partial "' + name + '"');
                }
                return [];
            }
            return unpack(partial);
        };
        getPartialFromRegistry = function (registry, name) {
            var partial, key;
            if (registry.partials[name]) {
                if (typeof registry.partials[name] === 'string') {
                    if (!parse) {
                        throw new Error(errors.missingParser);
                    }
                    partial = parse(registry.partials[name], registry.parseOptions);
                    if (isObject(partial)) {
                        registry.partials[name] = partial.main;
                        for (key in partial.partials) {
                            if (partial.partials.hasOwnProperty(key)) {
                                registry.partials[key] = partial.partials[key];
                            }
                        }
                    } else {
                        registry.partials[name] = partial;
                    }
                }
                return unpack(registry.partials[name]);
            }
        };
        unpack = function (partial) {
            if (partial.length === 1 && typeof partial[0] === 'string') {
                return partial[0];
            }
            return partial;
        };
        return getPartialDescriptor;
    }(config_errors, config_isClient, utils_warn, utils_isObject, registries_partials, parse__index);
var Partial__index = function (require, types, getPartialDescriptor) {
        
        var DomPartial, DomFragment;
        loadCircularDependency(function () {
            (function (dep) {
                DomFragment = dep;
            }(DomFragment__index));
        });
        DomPartial = function (options, docFrag) {
            var parentFragment = this.parentFragment = options.parentFragment, descriptor;
            this.type = types.PARTIAL;
            this.name = options.descriptor.r;
            this.index = options.index;
            if (!options.descriptor.r) {
                throw new Error('Partials must have a static reference (no expressions). This may change in a future version of Ractive.');
            }
            descriptor = getPartialDescriptor(parentFragment.root, options.descriptor.r);
            this.fragment = new DomFragment({
                descriptor: descriptor,
                root: parentFragment.root,
                parentNode: parentFragment.parentNode,
                contextStack: parentFragment.contextStack,
                owner: this
            });
            if (docFrag) {
                docFrag.appendChild(this.fragment.docFrag);
            }
        };
        DomPartial.prototype = {
            firstNode: function () {
                return this.fragment.firstNode();
            },
            findNextNode: function () {
                return this.parentFragment.findNextNode(this);
            },
            teardown: function (detach) {
                this.fragment.teardown(detach);
            },
            toString: function () {
                return this.fragment.toString();
            }
        };
        return DomPartial;
    }({}, config_types, Partial_getPartialDescriptor);
var Component_getComponentConstructor = function () {
        
        return function (ractive, name) {
            return ractive.components[name];
        };
    }();
var Component__index = function (types, resolveRef, getComponentConstructor, StringFragment) {
        
        var DomComponent, ComponentParameter;
        DomComponent = function (options, docFrag) {
            var self = this, parentFragment = this.parentFragment = options.parentFragment, root, Component, twoway, partials, instance, keypath, data, mappings, i, pair, observeParent, observeChild, settingParent, settingChild, key, initFalse, processKeyValuePair, eventName, propagateEvent, items;
            root = parentFragment.root;
            this.type = types.COMPONENT;
            this.name = options.descriptor.r;
            this.index = options.index;
            Component = getComponentConstructor(parentFragment.root, options.descriptor.e);
            if (!Component) {
                throw new Error('Component "' + options.descriptor.e + '" not found');
            }
            twoway = Component.twoway !== false;
            data = {};
            mappings = [];
            this.complexParameters = [];
            processKeyValuePair = function (key, value) {
                var parameter;
                if (typeof value === 'string') {
                    try {
                        data[key] = JSON.parse(value);
                    } catch (err) {
                        data[key] = value;
                    }
                    return;
                }
                if (value === null) {
                    data[key] = true;
                    return;
                }
                if (value.length === 1 && value[0].t === types.INTERPOLATOR && value[0].r) {
                    if (parentFragment.indexRefs && parentFragment.indexRefs[value[0].r] !== undefined) {
                        data[key] = parentFragment.indexRefs[value[0].r];
                        return;
                    }
                    keypath = resolveRef(root, value[0].r, parentFragment.contextStack) || value[0].r;
                    data[key] = root.get(keypath);
                    mappings[mappings.length] = [
                        key,
                        keypath
                    ];
                    return;
                }
                parameter = new ComponentParameter(root, self, key, value, parentFragment.contextStack);
                self.complexParameters[self.complexParameters.length] = parameter;
                data[key] = parameter.value;
            };
            if (options.descriptor.a) {
                for (key in options.descriptor.a) {
                    if (options.descriptor.a.hasOwnProperty(key)) {
                        processKeyValuePair(key, options.descriptor.a[key]);
                    }
                }
            }
            partials = {};
            if (options.descriptor.f) {
                partials.content = options.descriptor.f;
            }
            instance = this.instance = new Component({
                el: parentFragment.parentNode.cloneNode(false),
                data: data,
                partials: partials
            });
            instance.component = this;
            while (instance.el.firstChild) {
                docFrag.appendChild(instance.el.firstChild);
            }
            instance.el = parentFragment.parentNode;
            items = instance.fragment.items;
            if (items) {
                i = items.length;
                while (i--) {
                    if (items[i].parentNode) {
                        items[i].parentNode = parentFragment.parentNode;
                    }
                }
            }
            self.observers = [];
            initFalse = { init: false };
            observeParent = function (pair) {
                var observer = root.observe(pair[1], function (value) {
                        if (!settingParent) {
                            settingChild = true;
                            instance.set(pair[0], value);
                            settingChild = false;
                        }
                    }, initFalse);
                self.observers[self.observers.length] = observer;
            };
            if (twoway) {
                observeChild = function (pair) {
                    var observer = instance.observe(pair[0], function (value) {
                            if (!settingChild) {
                                settingParent = true;
                                root.set(pair[1], value);
                                settingParent = false;
                            }
                        }, initFalse);
                    self.observers[self.observers.length] = observer;
                    root.set(pair[1], instance.get(pair[0]));
                };
            }
            i = mappings.length;
            while (i--) {
                pair = mappings[i];
                observeParent(pair);
                if (twoway) {
                    observeChild(pair);
                }
            }
            propagateEvent = function (eventName, proxy) {
                instance.on(eventName, function () {
                    var args = Array.prototype.slice.call(arguments);
                    args.unshift(proxy);
                    root.fire.apply(root, args);
                });
            };
            if (options.descriptor.v) {
                for (eventName in options.descriptor.v) {
                    if (options.descriptor.v.hasOwnProperty(eventName)) {
                        propagateEvent(eventName, options.descriptor.v[eventName]);
                    }
                }
            }
        };
        DomComponent.prototype = {
            firstNode: function () {
                return this.instance.fragment.firstNode();
            },
            findNextNode: function () {
                return this.parentFragment.findNextNode(this);
            },
            teardown: function () {
                while (this.complexParameters.length) {
                    this.complexParameters.pop().teardown();
                }
                while (this.observers.length) {
                    this.observers.pop().cancel();
                }
                this.instance.teardown();
            },
            toString: function () {
                return this.instance.fragment.toString();
            }
        };
        ComponentParameter = function (root, component, key, value, contextStack) {
            this.parentFragment = component.parentFragment;
            this.component = component;
            this.key = key;
            this.fragment = new StringFragment({
                descriptor: value,
                root: root,
                owner: this,
                contextStack: contextStack
            });
            this.selfUpdating = this.fragment.isSimple();
            this.value = this.fragment.getValue();
        };
        ComponentParameter.prototype = {
            bubble: function () {
                if (this.selfUpdating) {
                    this.update();
                } else if (!this.deferred && this.ready) {
                    this.root._defAttrs[this.root._defAttrs.length] = this;
                    this.deferred = true;
                }
            },
            update: function () {
                var value = this.fragment.getValue();
                this.component.set(this.key, value);
                this.value = value;
            }
        };
        return DomComponent;
    }(config_types, shared_resolveRef, Component_getComponentConstructor, StringFragment__index);
var DomFragment_Comment = function (types) {
        
        var DomComment = function (options, docFrag) {
            this.type = types.COMMENT;
            this.descriptor = options.descriptor;
            if (docFrag) {
                this.node = document.createComment(options.descriptor.f);
                this.parentNode = options.parentFragment.parentNode;
                docFrag.appendChild(this.node);
            }
        };
        DomComment.prototype = {
            teardown: function (detach) {
                if (detach) {
                    this.node.parentNode.removeChild(this.node);
                }
            },
            firstNode: function () {
                return this.node;
            },
            toString: function () {
                return '<!--' + this.descriptor.f + '-->';
            }
        };
        return DomComment;
    }(config_types);
var DomFragment__index = function (types, initFragment, insertHtml, Text, Interpolator, Section, Triple, Element, Partial, Component, Comment) {
        
        var DomFragment = function (options) {
            if (options.parentNode) {
                this.docFrag = document.createDocumentFragment();
            }
            if (typeof options.descriptor === 'string') {
                this.html = options.descriptor;
                if (this.docFrag) {
                    this.nodes = insertHtml(options.descriptor, options.parentNode.tagName, this.docFrag);
                }
                return;
            }
            initFragment(this, options);
        };
        DomFragment.prototype = {
            createItem: function (options) {
                if (typeof options.descriptor === 'string') {
                    return new Text(options, this.docFrag);
                }
                switch (options.descriptor.t) {
                case types.INTERPOLATOR:
                    return new Interpolator(options, this.docFrag);
                case types.SECTION:
                    return new Section(options, this.docFrag);
                case types.TRIPLE:
                    return new Triple(options, this.docFrag);
                case types.ELEMENT:
                    return new Element(options, this.docFrag);
                case types.PARTIAL:
                    return new Partial(options, this.docFrag);
                case types.COMPONENT:
                    return new Component(options, this.docFrag);
                case types.COMMENT:
                    return new Comment(options, this.docFrag);
                default:
                    throw new Error('WTF? not sure what happened here...');
                }
            },
            teardown: function (detach) {
                var node;
                if (detach && this.nodes) {
                    while (this.nodes.length) {
                        node = this.nodes.pop();
                        node.parentNode.removeChild(node);
                    }
                    return;
                }
                if (!this.items) {
                    return;
                }
                while (this.items.length) {
                    this.items.pop().teardown(detach);
                }
            },
            firstNode: function () {
                if (this.items && this.items[0]) {
                    return this.items[0].firstNode();
                } else if (this.nodes) {
                    return this.nodes[0] || null;
                }
                return null;
            },
            findNextNode: function (item) {
                var index = item.index;
                if (this.items[index + 1]) {
                    return this.items[index + 1].firstNode();
                }
                if (this.owner === this.root) {
                    if (!this.owner.component) {
                        return null;
                    }
                    return this.owner.component.findNextNode();
                }
                return this.owner.findNextNode(this);
            },
            toString: function () {
                var html, i, len, item;
                if (this.html) {
                    return this.html;
                }
                html = '';
                if (!this.items) {
                    return html;
                }
                len = this.items.length;
                for (i = 0; i < len; i += 1) {
                    item = this.items[i];
                    html += item.toString();
                }
                return html;
            }
        };
        return DomFragment;
    }(config_types, shared_initFragment, shared_insertHtml, DomFragment_Text, DomFragment_Interpolator, DomFragment_Section, DomFragment_Triple, Element__index, Partial__index, Component__index, DomFragment_Comment);
var shared_render = function (getElement, makeTransitionManager, processDeferredUpdates, DomFragment) {
        
        return function (ractive, options) {
            var el, transitionManager;
            el = options.el ? getElement(options.el) : ractive.el;
            if (el && !options.append) {
                el.innerHTML = '';
            }
            ractive._transitionManager = transitionManager = makeTransitionManager(ractive, options.complete);
            ractive.fragment = new DomFragment({
                descriptor: ractive.template,
                root: ractive,
                owner: ractive,
                parentNode: el
            });
            processDeferredUpdates(ractive, true);
            if (el) {
                el.appendChild(ractive.fragment.docFrag);
            }
            while (ractive._defTransitions.length) {
                ractive._defTransitions.pop().init();
            }
            ractive._transitionManager = null;
            transitionManager.ready();
            ractive.rendered = true;
        };
    }(utils_getElement, shared_makeTransitionManager, shared_processDeferredUpdates, DomFragment__index);
var Ractive_initialise = function (isClient, errors, warn, create, extend, defineProperties, getElement, isObject, render, magicAdaptor, parse) {
        
        var getObject, getArray, defaultOptions, extendable;
        getObject = function () {
            return {};
        };
        getArray = function () {
            return [];
        };
        defaultOptions = create(null);
        defineProperties(defaultOptions, {
            preserveWhitespace: {
                enumerable: true,
                value: false
            },
            append: {
                enumerable: true,
                value: false
            },
            twoway: {
                enumerable: true,
                value: true
            },
            modifyArrays: {
                enumerable: true,
                value: true
            },
            data: {
                enumerable: true,
                value: getObject
            },
            lazy: {
                enumerable: true,
                value: false
            },
            debug: {
                enumerable: true,
                value: false
            },
            transitions: {
                enumerable: true,
                value: getObject
            },
            decorators: {
                enumerable: true,
                value: getObject
            },
            events: {
                enumerable: true,
                value: getObject
            },
            noIntro: {
                enumerable: true,
                value: false
            },
            transitionsEnabled: {
                enumerable: true,
                value: true
            },
            magic: {
                enumerable: true,
                value: false
            },
            adaptors: {
                enumerable: true,
                value: getArray
            }
        });
        extendable = [
            'components',
            'decorators',
            'events',
            'partials',
            'transitions'
        ];
        return function (ractive, options) {
            var key, template, templateEl, parsedTemplate;
            for (key in defaultOptions) {
                if (options[key] === undefined) {
                    options[key] = typeof defaultOptions[key] === 'function' ? defaultOptions[key]() : defaultOptions[key];
                }
            }
            defineProperties(ractive, {
                _guid: {
                    value: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                        var r, v;
                        r = Math.random() * 16 | 0, v = c == 'x' ? r : r & 3 | 8;
                        return v.toString(16);
                    })
                },
                _subs: { value: create(null) },
                _cache: { value: {} },
                _cacheMap: { value: create(null) },
                _deps: { value: [] },
                _depsMap: { value: create(null) },
                _pendingResolution: { value: [] },
                _defAttrs: { value: [] },
                _defEvals: { value: [] },
                _defSelectValues: { value: [] },
                _defCheckboxes: { value: [] },
                _defRadios: { value: [] },
                _defObservers: { value: [] },
                _defTransitions: { value: [] },
                _evaluators: { value: create(null) },
                _twowayBindings: { value: {} },
                _transitionManager: {
                    value: null,
                    writable: true
                },
                _animations: { value: [] },
                nodes: { value: {} },
                _wrapped: { value: create(null) }
            });
            ractive.data = options.data;
            ractive.adaptors = options.adaptors;
            ractive.modifyArrays = options.modifyArrays;
            ractive.magic = options.magic;
            ractive.twoway = options.twoway;
            ractive.lazy = options.lazy;
            ractive.debug = options.debug;
            if (ractive.magic && !magicAdaptor) {
                throw new Error('Getters and setters (magic mode) are not supported in this browser');
            }
            if (options.el) {
                ractive.el = getElement(options.el);
                if (!ractive.el && ractive.debug) {
                    throw new Error('Could not find container element');
                }
            }
            if (options.eventDefinitions) {
                warn('ractive.eventDefinitions has been deprecated in favour of ractive.events. Support will be removed in future versions');
                options.events = options.eventDefinitions;
            }
            extendable.forEach(function (registry) {
                ractive[registry] = extend(create(ractive.constructor[registry]), options[registry]);
            });
            template = options.template;
            if (typeof template === 'string') {
                if (!parse) {
                    throw new Error(errors.missingParser);
                }
                if (template.charAt(0) === '#' && isClient) {
                    templateEl = document.getElementById(template.substring(1));
                    if (templateEl) {
                        parsedTemplate = parse(templateEl.innerHTML, options);
                    } else {
                        throw new Error('Could not find template element (' + template + ')');
                    }
                } else {
                    parsedTemplate = parse(template, options);
                }
            } else {
                parsedTemplate = template;
            }
            if (isObject(parsedTemplate)) {
                extend(ractive.partials, parsedTemplate.partials);
                parsedTemplate = parsedTemplate.main;
            }
            if (parsedTemplate && parsedTemplate.length === 1 && typeof parsedTemplate[0] === 'string') {
                parsedTemplate = parsedTemplate[0];
            }
            ractive.template = parsedTemplate;
            extend(ractive.partials, options.partials);
            ractive.parseOptions = {
                preserveWhitespace: options.preserveWhitespace,
                sanitize: options.sanitize,
                stripComments: options.stripComments
            };
            ractive.transitionsEnabled = options.noIntro ? false : options.transitionsEnabled;
            render(ractive, {
                el: ractive.el,
                append: options.append,
                complete: options.complete
            });
            ractive.transitionsEnabled = options.transitionsEnabled;
        };
    }(config_isClient, config_errors, utils_warn, utils_create, utils_extend, utils_defineProperties, utils_getElement, utils_isObject, shared_render, get_magicAdaptor, parse__index);
var extend__extend = function (errors, create, isClient, isObject, parse, initialise, adaptorRegistry) {
        
        var extend, fillGaps, clone, augment, inheritFromParent, wrapMethod, inheritFromChildProps, conditionallyParseTemplate, extractInlinePartials, conditionallyParsePartials, initChildInstance, extendable, inheritable, blacklist;
        extend = function (childProps) {
            var Parent = this, Child;
            Child = function (options) {
                initChildInstance(this, Child, options || {});
            };
            Child.prototype = create(Parent.prototype);
            if (Parent.adaptors !== adaptorRegistry) {
                inheritFromParent(Child, Parent);
            }
            inheritFromChildProps(Child, childProps);
            conditionallyParseTemplate(Child);
            extractInlinePartials(Child, childProps);
            conditionallyParsePartials(Child);
            Child.extend = Parent.extend;
            return Child;
        };
        extendable = [
            'data',
            'partials',
            'transitions',
            'eventDefinitions',
            'components',
            'decorators'
        ];
        inheritable = [
            'el',
            'template',
            'complete',
            'modifyArrays',
            'twoway',
            'lazy',
            'append',
            'preserveWhitespace',
            'sanitize',
            'noIntro',
            'transitionsEnabled'
        ];
        blacklist = {};
        extendable.concat(inheritable).forEach(function (prop) {
            blacklist[prop] = true;
        });
        inheritFromParent = function (Child, Parent) {
            extendable.forEach(function (property) {
                if (Parent[property]) {
                    Child[property] = clone(Parent[property]);
                }
            });
            inheritable.forEach(function (property) {
                if (Parent[property] !== undefined) {
                    Child[property] = Parent[property];
                }
            });
        };
        wrapMethod = function (method, superMethod) {
            if (/_super/.test(method)) {
                return function () {
                    var _super = this._super, result;
                    this._super = superMethod;
                    result = method.apply(this, arguments);
                    this._super = _super;
                    return result;
                };
            } else {
                return method;
            }
        };
        inheritFromChildProps = function (Child, childProps) {
            var key, member;
            extendable.forEach(function (property) {
                var value = childProps[property];
                if (value) {
                    if (Child[property]) {
                        augment(Child[property], value);
                    } else {
                        Child[property] = value;
                    }
                }
            });
            inheritable.forEach(function (property) {
                if (childProps[property] !== undefined) {
                    Child[property] = childProps[property];
                }
            });
            for (key in childProps) {
                if (childProps.hasOwnProperty(key) && !Child.prototype.hasOwnProperty(key) && !blacklist[key]) {
                    member = childProps[key];
                    if (typeof member === 'function' && typeof Child.prototype[key] === 'function') {
                        Child.prototype[key] = wrapMethod(member, Child.prototype[key]);
                    } else {
                        Child.prototype[key] = member;
                    }
                }
            }
        };
        conditionallyParseTemplate = function (Child) {
            var templateEl;
            if (typeof Child.template === 'string') {
                if (!parse) {
                    throw new Error(errors.missingParser);
                }
                if (Child.template.charAt(0) === '#' && isClient) {
                    templateEl = document.getElementById(Child.template.substring(1));
                    if (templateEl && templateEl.tagName === 'SCRIPT') {
                        Child.template = parse(templateEl.innerHTML, Child);
                    } else {
                        throw new Error('Could not find template element (' + Child.template + ')');
                    }
                } else {
                    Child.template = parse(Child.template, Child);
                }
            }
        };
        extractInlinePartials = function (Child, childProps) {
            if (isObject(Child.template)) {
                if (!Child.partials) {
                    Child.partials = {};
                }
                augment(Child.partials, Child.template.partials);
                if (childProps.partials) {
                    augment(Child.partials, childProps.partials);
                }
                Child.template = Child.template.main;
            }
        };
        conditionallyParsePartials = function (Child) {
            var key, partial;
            if (Child.partials) {
                for (key in Child.partials) {
                    if (Child.partials.hasOwnProperty(key)) {
                        if (typeof Child.partials[key] === 'string') {
                            if (!parse) {
                                throw new Error(errors.missingParser);
                            }
                            partial = parse(Child.partials[key], Child);
                        } else {
                            partial = Child.partials[key];
                        }
                        Child.partials[key] = partial;
                    }
                }
            }
        };
        initChildInstance = function (child, Child, options) {
            if (!options.template && Child.template) {
                options.template = Child.template;
            }
            extendable.forEach(function (property) {
                if (!options[property]) {
                    if (Child[property]) {
                        options[property] = clone(Child[property]);
                    }
                } else {
                    fillGaps(options[property], Child[property]);
                }
            });
            inheritable.forEach(function (property) {
                if (options[property] === undefined && Child[property] !== undefined) {
                    options[property] = Child[property];
                }
            });
            if (child.beforeInit) {
                child.beforeInit.call(child, options);
            }
            initialise(child, options);
            if (child.init) {
                child.init.call(child, options);
            }
        };
        fillGaps = function (target, source) {
            var key;
            for (key in source) {
                if (source.hasOwnProperty(key) && !target.hasOwnProperty(key)) {
                    target[key] = source[key];
                }
            }
        };
        clone = function (source) {
            var target = {}, key;
            for (key in source) {
                if (source.hasOwnProperty(key)) {
                    target[key] = source[key];
                }
            }
            return target;
        };
        augment = function (target, source) {
            var key;
            for (key in source) {
                if (source.hasOwnProperty(key)) {
                    target[key] = source[key];
                }
            }
        };
        return extend;
    }(config_errors, utils_create, config_isClient, utils_isObject, parse__index, Ractive_initialise, registries_adaptors);
var Ractive__index = function (create, defineProperties, prototype, partialRegistry, adaptorRegistry, easingRegistry, Ractive_extend, parse, initialise) {
        
        var Ractive = function (options) {
            initialise(this, options);
        };
        Ractive.prototype = prototype;
        Ractive.prototype.constructor = Ractive;
        Ractive.partials = partialRegistry;
        Ractive.delimiters = [
            '{{',
            '}}'
        ];
        Ractive.tripleDelimiters = [
            '{{{',
            '}}}'
        ];
        Ractive.adaptors = adaptorRegistry;
        Ractive.transitions = {};
        Ractive.events = Ractive.eventDefinitions = {};
        Ractive.easing = easingRegistry;
        Ractive.components = {};
        Ractive.decorators = {};
        Ractive.extend = Ractive_extend;
        Ractive.parse = parse;
        Ractive.VERSION = '0.3.8-pre';
        return Ractive;
    }(utils_create, utils_defineProperties, prototype__index, registries_partials, registries_adaptors, registries_easing, extend__extend, parse__index, Ractive_initialise);
var Ractive = function (Ractive) {
        
        return Ractive;
    }(Ractive__index);while ( loadCircularDependency.callbacks.length ) {
	loadCircularDependency.callbacks.pop()();
}


// export as Common JS module...
if ( typeof module !== "undefined" && module.exports ) {
	module.exports = Ractive;
}

// ... or as AMD module
else if ( typeof define === "function" && define.amd ) {
	define( function () {
		return Ractive;
	});
}

// ... or as browser global
else {
	global.Ractive = Ractive;
}

}( typeof window !== 'undefined' ? window : this ));