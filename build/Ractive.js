/*
	
	Ractive - v0.3.8-pre - 2013-11-06
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
var get__index = function (normaliseKeypath, arrayAdaptor, magicAdaptor) {
        
        var get, Ractive, _get, retrieve, prefix, getPrefixer, prefixers = {}, adaptIfNecessary;
        loadCircularDependency(function () {
            (function (dep) {
                Ractive = dep;
            }(Ractive__index));
        });
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
                    if (!Ractive.adaptors[adaptor]) {
                        throw new Error('Missing adaptor "' + adaptor + '"');
                    }
                    adaptor = ractive.adaptors[i] = Ractive.adaptors[adaptor];
                }
                if (adaptor.filter(value, keypath, ractive)) {
                    wrapped = ractive._wrapped[keypath] = adaptor.wrap(ractive, value, keypath, getPrefixer(keypath));
                    ractive._cache[keypath] = value;
                    return true;
                }
            }
        };
        return get;
    }(utils_normaliseKeypath, get_arrayAdaptor, get_magicAdaptor);
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
var static_interpolators = function () {
        
        var interpolate;
        loadCircularDependency(function () {
            (function (dep) {
                interpolate = dep;
            }(static_interpolate));
        });
        return {
            number: function (from, to) {
                var delta = to - from;
                if (!delta) {
                    return function () {
                        return from;
                    };
                }
                return function (t) {
                    return from + t * delta;
                };
            },
            array: function (from, to) {
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
            },
            object: function (from, to) {
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
        };
    }();
var static_interpolate = function (isArray, isObject, isNumeric, interpolators) {
        
        return function (from, to) {
            if (isNumeric(from) && isNumeric(to)) {
                return interpolators.number(+from, +to);
            }
            if (isArray(from) && isArray(to)) {
                return interpolators.array(from, to);
            }
            if (isObject(from) && isObject(to)) {
                return interpolators.object(from, to);
            }
            return function () {
                return to;
            };
        };
    }(utils_isArray, utils_isObject, utils_isNumeric, static_interpolators);
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
    }(utils_warn, static_interpolate);
var animate__index = function (isEqual, animationCollection, Animation) {
        
        var animate, Ractive, _animate, noAnimation;
        loadCircularDependency(function () {
            (function (dep) {
                Ractive = dep;
            }(Ractive__index));
        });
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
                        easing = Ractive.easing[options.easing];
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
    }(utils_isEqual, animate_animationCollection, animate_Animation);
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
var prototype__index = function (get, set, update, updateModel, animate, on, off, observe, fire, find, findAll, renderHTML, teardown) {
        
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
            teardown: teardown
        };
    }(get__index, prototype_set, prototype_update, prototype_updateModel, animate__index, prototype_on, prototype_off, prototype_observe, prototype_fire, prototype_find, prototype_findAll, prototype_renderHTML, prototype_teardown);
var registries_partials = {};
var static_easing = function () {
        
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
var config_errors = { missingParser: 'Missing Ractive.parse - cannot parse template. Either preparse or use the version that includes the parser' };
var utils_stripHtmlComments = function () {
        
        return function (html) {
            var commentStart, commentEnd, processed;
            processed = '';
            while (html.length) {
                commentStart = html.indexOf('<!--');
                commentEnd = html.indexOf('-->');
                if (commentStart === -1 && commentEnd === -1) {
                    processed += html;
                    break;
                }
                if (commentStart !== -1 && commentEnd === -1) {
                    throw 'Illegal HTML - expected closing comment sequence (\'-->\')';
                }
                if (commentEnd !== -1 && commentStart === -1 || commentEnd < commentStart) {
                    throw 'Illegal HTML - unexpected closing comment sequence (\'-->\')';
                }
                processed += html.substr(0, commentStart);
                html = html.substring(commentEnd + 3);
            }
            return processed;
        };
    }();
var utils_stripStandalones = function (types) {
        
        return function (tokens) {
            var i, current, backOne, backTwo, leadingLinebreak, trailingLinebreak;
            leadingLinebreak = /^\s*\r?\n/;
            trailingLinebreak = /\r?\n\s*$/;
            for (i = 2; i < tokens.length; i += 1) {
                current = tokens[i];
                backOne = tokens[i - 1];
                backTwo = tokens[i - 2];
                if (current.type === types.TEXT && backOne.type === types.MUSTACHE && backTwo.type === types.TEXT) {
                    if (trailingLinebreak.test(backTwo.value) && leadingLinebreak.test(current.value)) {
                        if (backOne.mustacheType !== types.INTERPOLATOR && backOne.mustacheType !== types.TRIPLE) {
                            backTwo.value = backTwo.value.replace(trailingLinebreak, '\n');
                        }
                        current.value = current.value.replace(leadingLinebreak, '');
                        if (current.value === '') {
                            tokens.splice(i--, 1);
                        }
                    }
                }
            }
            return tokens;
        };
    }(config_types);
var utils_stripCommentTokens = function (types) {
        
        return function (tokens) {
            var i, current, previous, next;
            for (i = 0; i < tokens.length; i += 1) {
                current = tokens[i];
                previous = tokens[i - 1];
                next = tokens[i + 1];
                if (current.mustacheType === types.COMMENT || current.mustacheType === types.DELIMCHANGE) {
                    tokens.splice(i, 1);
                    if (previous && next) {
                        if (previous.type === types.TEXT && next.type === types.TEXT) {
                            previous.value += next.value;
                            tokens.splice(i, 1);
                        }
                    }
                    i -= 1;
                }
            }
            return tokens;
        };
    }(config_types);
var utils_makeRegexMatcher = function () {
        
        return function (regex) {
            return function (tokenizer) {
                var match = regex.exec(tokenizer.str.substring(tokenizer.pos));
                if (!match) {
                    return null;
                }
                tokenizer.pos += match[0].length;
                return match[1] || match[0];
            };
        };
    }();
var getMustache_getDelimiterChange = function (makeRegexMatcher) {
        
        var getDelimiter = makeRegexMatcher(/^[^\s=]+/);
        return function (tokenizer) {
            var start, opening, closing;
            if (!tokenizer.getStringMatch('=')) {
                return null;
            }
            start = tokenizer.pos;
            tokenizer.allowWhitespace();
            opening = getDelimiter(tokenizer);
            if (!opening) {
                tokenizer.pos = start;
                return null;
            }
            tokenizer.allowWhitespace();
            closing = getDelimiter(tokenizer);
            if (!closing) {
                tokenizer.pos = start;
                return null;
            }
            tokenizer.allowWhitespace();
            if (!tokenizer.getStringMatch('=')) {
                tokenizer.pos = start;
                return null;
            }
            return [
                opening,
                closing
            ];
        };
    }(utils_makeRegexMatcher);
var getMustache_getMustacheType = function (types) {
        
        var mustacheTypes = {
                '#': types.SECTION,
                '^': types.INVERTED,
                '/': types.CLOSING,
                '>': types.PARTIAL,
                '!': types.COMMENT,
                '&': types.INTERPOLATOR
            };
        return function (tokenizer) {
            var type = mustacheTypes[tokenizer.str.charAt(tokenizer.pos)];
            if (!type) {
                return null;
            }
            tokenizer.pos += 1;
            return type;
        };
    }(config_types);
var getMustache_getMustacheContent = function (types, makeRegexMatcher, getMustacheType) {
        
        var getIndexRef = makeRegexMatcher(/^\s*:\s*([a-zA-Z_$][a-zA-Z_$0-9]*)/);
        return function (tokenizer, isTriple) {
            var start, mustache, type, expr, i, remaining, index;
            start = tokenizer.pos;
            mustache = { type: isTriple ? types.TRIPLE : types.MUSTACHE };
            if (!isTriple) {
                type = getMustacheType(tokenizer);
                mustache.mustacheType = type || types.INTERPOLATOR;
                if (type === types.COMMENT || type === types.CLOSING) {
                    remaining = tokenizer.remaining();
                    index = remaining.indexOf(tokenizer.delimiters[1]);
                    if (index !== -1) {
                        mustache.ref = remaining.substr(0, index);
                        tokenizer.pos += index;
                        return mustache;
                    }
                }
            }
            tokenizer.allowWhitespace();
            expr = tokenizer.getExpression();
            while (expr.t === types.BRACKETED && expr.x) {
                expr = expr.x;
            }
            if (expr.t === types.REFERENCE) {
                mustache.ref = expr.n;
            } else {
                mustache.expression = expr;
            }
            i = getIndexRef(tokenizer);
            if (i !== null) {
                mustache.indexRef = i;
            }
            return mustache;
        };
    }(config_types, utils_makeRegexMatcher, getMustache_getMustacheType);
var getMustache__index = function (types, getDelimiterChange, getMustacheContent) {
        
        return function () {
            var seekTripleFirst = this.tripleDelimiters[0].length > this.delimiters[0].length;
            return getMustache(this, seekTripleFirst) || getMustache(this, !seekTripleFirst);
        };
        function getMustache(tokenizer, seekTriple) {
            var start = tokenizer.pos, content, delimiters;
            delimiters = seekTriple ? tokenizer.tripleDelimiters : tokenizer.delimiters;
            if (!tokenizer.getStringMatch(delimiters[0])) {
                return null;
            }
            content = getDelimiterChange(tokenizer);
            if (content) {
                if (!tokenizer.getStringMatch(delimiters[1])) {
                    tokenizer.pos = start;
                    return null;
                }
                tokenizer[seekTriple ? 'tripleDelimiters' : 'delimiters'] = content;
                return {
                    type: types.MUSTACHE,
                    mustacheType: types.DELIMCHANGE
                };
            }
            tokenizer.allowWhitespace();
            content = getMustacheContent(tokenizer, seekTriple);
            if (content === null) {
                tokenizer.pos = start;
                return null;
            }
            tokenizer.allowWhitespace();
            if (!tokenizer.getStringMatch(delimiters[1])) {
                tokenizer.pos = start;
                return null;
            }
            return content;
        }
    }(config_types, getMustache_getDelimiterChange, getMustache_getMustacheContent);
var getComment_getComment = function (types) {
        
        return function () {
            var content, remaining, endIndex;
            if (!this.getStringMatch('<!--')) {
                return null;
            }
            remaining = this.remaining();
            endIndex = remaining.indexOf('-->');
            if (endIndex === -1) {
                throw new Error('Unexpected end of input (expected "-->" to close comment)');
            }
            content = remaining.substr(0, endIndex);
            this.pos += endIndex + 3;
            return {
                type: types.COMMENT,
                content: content
            };
        };
    }(config_types);
var utils_getLowestIndex = function () {
        
        return function (haystack, needles) {
            var i, index, lowest;
            i = needles.length;
            while (i--) {
                index = haystack.indexOf(needles[i]);
                if (!index) {
                    return 0;
                }
                if (index === -1) {
                    continue;
                }
                if (!lowest || index < lowest) {
                    lowest = index;
                }
            }
            return lowest || -1;
        };
    }();
var getTag__index = function (types, makeRegexMatcher, getLowestIndex) {
        
        var getTag, getOpeningTag, getClosingTag, getTagName, getAttributes, getAttribute, getAttributeName, getAttributeValue, getUnquotedAttributeValue, getUnquotedAttributeValueToken, getUnquotedAttributeValueText, getQuotedStringToken, getQuotedAttributeValue;
        getTag = function () {
            return getOpeningTag(this) || getClosingTag(this);
        };
        getOpeningTag = function (tokenizer) {
            var start, tag, attrs;
            start = tokenizer.pos;
            if (!tokenizer.getStringMatch('<')) {
                return null;
            }
            tag = { type: types.TAG };
            if (tokenizer.getStringMatch('!')) {
                tag.doctype = true;
            }
            tag.name = getTagName(tokenizer);
            if (!tag.name) {
                tokenizer.pos = start;
                return null;
            }
            attrs = getAttributes(tokenizer);
            if (attrs) {
                tag.attrs = attrs;
            }
            tokenizer.allowWhitespace();
            if (tokenizer.getStringMatch('/')) {
                tag.selfClosing = true;
            }
            if (!tokenizer.getStringMatch('>')) {
                tokenizer.pos = start;
                return null;
            }
            return tag;
        };
        getClosingTag = function (tokenizer) {
            var start, tag;
            start = tokenizer.pos;
            if (!tokenizer.getStringMatch('<')) {
                return null;
            }
            tag = {
                type: types.TAG,
                closing: true
            };
            if (!tokenizer.getStringMatch('/')) {
                throw new Error('Unexpected character ' + tokenizer.remaining().charAt(0) + ' (expected "/")');
            }
            tag.name = getTagName(tokenizer);
            if (!tag.name) {
                throw new Error('Unexpected character ' + tokenizer.remaining().charAt(0) + ' (expected tag name)');
            }
            if (!tokenizer.getStringMatch('>')) {
                throw new Error('Unexpected character ' + tokenizer.remaining().charAt(0) + ' (expected ">")');
            }
            return tag;
        };
        getTagName = makeRegexMatcher(/^[a-zA-Z]{1,}:?[a-zA-Z0-9\-]*/);
        getAttributes = function (tokenizer) {
            var start, attrs, attr;
            start = tokenizer.pos;
            tokenizer.allowWhitespace();
            attr = getAttribute(tokenizer);
            if (!attr) {
                tokenizer.pos = start;
                return null;
            }
            attrs = [];
            while (attr !== null) {
                attrs[attrs.length] = attr;
                tokenizer.allowWhitespace();
                attr = getAttribute(tokenizer);
            }
            return attrs;
        };
        getAttribute = function (tokenizer) {
            var attr, name, value;
            name = getAttributeName(tokenizer);
            if (!name) {
                return null;
            }
            attr = { name: name };
            value = getAttributeValue(tokenizer);
            if (value) {
                attr.value = value;
            }
            return attr;
        };
        getAttributeName = makeRegexMatcher(/^[^\s"'>\/=]+/);
        getAttributeValue = function (tokenizer) {
            var start, value;
            start = tokenizer.pos;
            tokenizer.allowWhitespace();
            if (!tokenizer.getStringMatch('=')) {
                tokenizer.pos = start;
                return null;
            }
            tokenizer.allowWhitespace();
            value = getQuotedAttributeValue(tokenizer, '\'') || getQuotedAttributeValue(tokenizer, '"') || getUnquotedAttributeValue(tokenizer);
            if (value === null) {
                tokenizer.pos = start;
                return null;
            }
            return value;
        };
        getUnquotedAttributeValueText = makeRegexMatcher(/^[^\s"'=<>`]+/);
        getUnquotedAttributeValueToken = function (tokenizer) {
            var start, text, index;
            start = tokenizer.pos;
            text = getUnquotedAttributeValueText(tokenizer);
            if (!text) {
                return null;
            }
            if ((index = text.indexOf(tokenizer.delimiters[0])) !== -1) {
                text = text.substr(0, index);
                tokenizer.pos = start + text.length;
            }
            return {
                type: types.TEXT,
                value: text
            };
        };
        getUnquotedAttributeValue = function (tokenizer) {
            var tokens, token;
            tokens = [];
            token = tokenizer.getMustache() || getUnquotedAttributeValueToken(tokenizer);
            while (token !== null) {
                tokens[tokens.length] = token;
                token = tokenizer.getMustache() || getUnquotedAttributeValueToken(tokenizer);
            }
            if (!tokens.length) {
                return null;
            }
            return tokens;
        };
        getQuotedAttributeValue = function (tokenizer, quoteMark) {
            var start, tokens, token;
            start = tokenizer.pos;
            if (!tokenizer.getStringMatch(quoteMark)) {
                return null;
            }
            tokens = [];
            token = tokenizer.getMustache() || getQuotedStringToken(tokenizer, quoteMark);
            while (token !== null) {
                tokens[tokens.length] = token;
                token = tokenizer.getMustache() || getQuotedStringToken(tokenizer, quoteMark);
            }
            if (!tokenizer.getStringMatch(quoteMark)) {
                tokenizer.pos = start;
                return null;
            }
            return tokens;
        };
        getQuotedStringToken = function (tokenizer, quoteMark) {
            var start, index, remaining;
            start = tokenizer.pos;
            remaining = tokenizer.remaining();
            index = getLowestIndex(remaining, [
                quoteMark,
                tokenizer.delimiters[0],
                tokenizer.delimiters[1]
            ]);
            if (index === -1) {
                throw new Error('Quoted attribute value must have a closing quote');
            }
            if (!index) {
                return null;
            }
            tokenizer.pos += index;
            return {
                type: types.TEXT,
                value: remaining.substr(0, index)
            };
        };
        return getTag;
    }(config_types, utils_makeRegexMatcher, utils_getLowestIndex);
var getText_getText = function (types, getLowestIndex) {
        
        return function () {
            var index, remaining;
            remaining = this.remaining();
            index = getLowestIndex(remaining, [
                '<',
                this.delimiters[0],
                this.tripleDelimiters[0]
            ]);
            if (!index) {
                return null;
            }
            if (index === -1) {
                index = remaining.length;
            }
            this.pos += index;
            return {
                type: types.TEXT,
                value: remaining.substr(0, index)
            };
        };
    }(config_types, utils_getLowestIndex);
var getLiteral_getNumberLiteral = function (types, makeRegexMatcher) {
        
        var getExponent = makeRegexMatcher(/^[eE][\-+]?[0-9]+/), getFraction = makeRegexMatcher(/^\.[0-9]+/), getInteger = makeRegexMatcher(/^(0|[1-9][0-9]*)/);
        return function (tokenizer) {
            var start, result;
            start = tokenizer.pos;
            if (result = getFraction(tokenizer)) {
                return {
                    t: types.NUMBER_LITERAL,
                    v: result
                };
            }
            result = getInteger(tokenizer);
            if (result === null) {
                return null;
            }
            result += getFraction(tokenizer) || '';
            result += getExponent(tokenizer) || '';
            return {
                t: types.NUMBER_LITERAL,
                v: result
            };
        };
    }(config_types, utils_makeRegexMatcher);
var getLiteral_getBooleanLiteral = function (types) {
        
        return function (tokenizer) {
            var remaining = tokenizer.remaining();
            if (remaining.substr(0, 4) === 'true') {
                tokenizer.pos += 4;
                return {
                    t: types.BOOLEAN_LITERAL,
                    v: 'true'
                };
            }
            if (remaining.substr(0, 5) === 'false') {
                tokenizer.pos += 5;
                return {
                    t: types.BOOLEAN_LITERAL,
                    v: 'false'
                };
            }
            return null;
        };
    }(config_types);
var getStringLiteral_getEscapedChars = function () {
        
        return function (tokenizer) {
            var chars = '', character;
            character = getEscapedChar(tokenizer);
            while (character) {
                chars += character;
                character = getEscapedChar(tokenizer);
            }
            return chars || null;
        };
        function getEscapedChar(tokenizer) {
            var character;
            if (!tokenizer.getStringMatch('\\')) {
                return null;
            }
            character = tokenizer.str.charAt(tokenizer.pos);
            tokenizer.pos += 1;
            return character;
        }
    }();
var getStringLiteral_getQuotedString = function (makeRegexMatcher, getEscapedChars) {
        
        var getUnescapedDoubleQuotedChars = makeRegexMatcher(/^[^\\"]+/), getUnescapedSingleQuotedChars = makeRegexMatcher(/^[^\\']+/);
        return function getQuotedString(tokenizer, singleQuotes) {
            var start, string, escaped, unescaped, next, matcher;
            start = tokenizer.pos;
            string = '';
            matcher = singleQuotes ? getUnescapedSingleQuotedChars : getUnescapedDoubleQuotedChars;
            escaped = getEscapedChars(tokenizer);
            if (escaped) {
                string += escaped;
            }
            unescaped = matcher(tokenizer);
            if (unescaped) {
                string += unescaped;
            }
            if (!string) {
                return '';
            }
            next = getQuotedString(tokenizer, singleQuotes);
            while (next !== '') {
                string += next;
            }
            return string;
        };
    }(utils_makeRegexMatcher, getStringLiteral_getEscapedChars);
var getStringLiteral__index = function (types, getQuotedString) {
        
        return function (tokenizer) {
            var start, string;
            start = tokenizer.pos;
            if (tokenizer.getStringMatch('"')) {
                string = getQuotedString(tokenizer, false);
                if (!tokenizer.getStringMatch('"')) {
                    tokenizer.pos = start;
                    return null;
                }
                return {
                    t: types.STRING_LITERAL,
                    v: string
                };
            }
            if (tokenizer.getStringMatch('\'')) {
                string = getQuotedString(tokenizer, true);
                if (!tokenizer.getStringMatch('\'')) {
                    tokenizer.pos = start;
                    return null;
                }
                return {
                    t: types.STRING_LITERAL,
                    v: string
                };
            }
            return null;
        };
    }(config_types, getStringLiteral_getQuotedString);
var shared_getName = function (makeRegexMatcher) {
        
        return makeRegexMatcher(/^[a-zA-Z_$][a-zA-Z_$0-9]*/);
    }(utils_makeRegexMatcher);
var getObjectLiteral_getKeyValuePair = function (types, getName, getStringLiteral, getNumberLiteral) {
        
        return function (tokenizer) {
            var start, key, value;
            start = tokenizer.pos;
            tokenizer.allowWhitespace();
            key = getKey(tokenizer);
            if (key === null) {
                tokenizer.pos = start;
                return null;
            }
            tokenizer.allowWhitespace();
            if (!tokenizer.getStringMatch(':')) {
                tokenizer.pos = start;
                return null;
            }
            tokenizer.allowWhitespace();
            value = tokenizer.getExpression();
            if (value === null) {
                tokenizer.pos = start;
                return null;
            }
            return {
                t: types.KEY_VALUE_PAIR,
                k: key,
                v: value
            };
        };
        function getKey(tokenizer) {
            return getName(tokenizer) || getStringLiteral(tokenizer) || getNumberLiteral(tokenizer);
        }
    }(config_types, shared_getName, getStringLiteral__index, getLiteral_getNumberLiteral);
var getObjectLiteral_getKeyValuePairs = function (getKeyValuePair) {
        
        return function getKeyValuePairs(tokenizer) {
            var start, pairs, pair, keyValuePairs;
            start = tokenizer.pos;
            pair = getKeyValuePair(tokenizer);
            if (pair === null) {
                return null;
            }
            pairs = [pair];
            if (tokenizer.getStringMatch(',')) {
                keyValuePairs = getKeyValuePairs(tokenizer);
                if (!keyValuePairs) {
                    tokenizer.pos = start;
                    return null;
                }
                return pairs.concat(keyValuePairs);
            }
            return pairs;
        };
    }(getObjectLiteral_getKeyValuePair);
var getObjectLiteral__index = function (types, getKeyValuePairs) {
        
        return function (tokenizer) {
            var start, keyValuePairs;
            start = tokenizer.pos;
            tokenizer.allowWhitespace();
            if (!tokenizer.getStringMatch('{')) {
                tokenizer.pos = start;
                return null;
            }
            keyValuePairs = getKeyValuePairs(tokenizer);
            tokenizer.allowWhitespace();
            if (!tokenizer.getStringMatch('}')) {
                tokenizer.pos = start;
                return null;
            }
            return {
                t: types.OBJECT_LITERAL,
                m: keyValuePairs
            };
        };
    }(config_types, getObjectLiteral_getKeyValuePairs);
var shared_getExpressionList = function () {
        
        return function getExpressionList(tokenizer) {
            var start, expressions, expr, next;
            start = tokenizer.pos;
            tokenizer.allowWhitespace();
            expr = tokenizer.getExpression();
            if (expr === null) {
                return null;
            }
            expressions = [expr];
            tokenizer.allowWhitespace();
            if (tokenizer.getStringMatch(',')) {
                next = getExpressionList(tokenizer);
                if (next === null) {
                    tokenizer.pos = start;
                    return null;
                }
                expressions = expressions.concat(next);
            }
            return expressions;
        };
    }();
var getLiteral_getArrayLiteral = function (types, getExpressionList) {
        
        return function (tokenizer) {
            var start, expressionList;
            start = tokenizer.pos;
            tokenizer.allowWhitespace();
            if (!tokenizer.getStringMatch('[')) {
                tokenizer.pos = start;
                return null;
            }
            expressionList = getExpressionList(tokenizer);
            if (!tokenizer.getStringMatch(']')) {
                tokenizer.pos = start;
                return null;
            }
            return {
                t: types.ARRAY_LITERAL,
                m: expressionList
            };
        };
    }(config_types, shared_getExpressionList);
var getLiteral__index = function (getNumberLiteral, getBooleanLiteral, getStringLiteral, getObjectLiteral, getArrayLiteral) {
        
        return function (tokenizer) {
            var literal = getNumberLiteral(tokenizer) || getBooleanLiteral(tokenizer) || getStringLiteral(tokenizer) || getObjectLiteral(tokenizer) || getArrayLiteral(tokenizer);
            return literal;
        };
    }(getLiteral_getNumberLiteral, getLiteral_getBooleanLiteral, getStringLiteral__index, getObjectLiteral__index, getLiteral_getArrayLiteral);
var getPrimary_getReference = function (types, makeRegexMatcher, getName) {
        
        var getDotRefinement, getArrayRefinement, getArrayMember, globals;
        getDotRefinement = makeRegexMatcher(/^\.[a-zA-Z_$0-9]+/);
        getArrayRefinement = function (tokenizer) {
            var num = getArrayMember(tokenizer);
            if (num) {
                return '.' + num;
            }
            return null;
        };
        getArrayMember = makeRegexMatcher(/^\[(0|[1-9][0-9]*)\]/);
        globals = /^(?:Array|Date|RegExp|decodeURIComponent|decodeURI|encodeURIComponent|encodeURI|isFinite|isNaN|parseFloat|parseInt|JSON|Math|NaN|undefined|null)$/;
        return function (tokenizer) {
            var startPos, ancestor, name, dot, combo, refinement, lastDotIndex;
            startPos = tokenizer.pos;
            ancestor = '';
            while (tokenizer.getStringMatch('../')) {
                ancestor += '../';
            }
            if (!ancestor) {
                dot = tokenizer.getStringMatch('.') || '';
            }
            name = getName(tokenizer) || '';
            if (!ancestor && !dot && globals.test(name)) {
                return {
                    t: types.GLOBAL,
                    v: name
                };
            }
            if (name === 'this' && !ancestor && !dot) {
                name = '.';
                startPos += 3;
            }
            combo = (ancestor || dot) + name;
            if (!combo) {
                return null;
            }
            while (refinement = getDotRefinement(tokenizer) || getArrayRefinement(tokenizer)) {
                combo += refinement;
            }
            if (tokenizer.getStringMatch('(')) {
                lastDotIndex = combo.lastIndexOf('.');
                if (lastDotIndex !== -1) {
                    combo = combo.substr(0, lastDotIndex);
                    tokenizer.pos = startPos + combo.length;
                } else {
                    tokenizer.pos -= 1;
                }
            }
            return {
                t: types.REFERENCE,
                n: combo
            };
        };
    }(config_types, utils_makeRegexMatcher, shared_getName);
var getPrimary_getBracketedExpression = function (types) {
        
        return function (tokenizer) {
            var start, expr;
            start = tokenizer.pos;
            if (!tokenizer.getStringMatch('(')) {
                return null;
            }
            tokenizer.allowWhitespace();
            expr = tokenizer.getExpression();
            if (!expr) {
                tokenizer.pos = start;
                return null;
            }
            tokenizer.allowWhitespace();
            if (!tokenizer.getStringMatch(')')) {
                tokenizer.pos = start;
                return null;
            }
            return {
                t: types.BRACKETED,
                x: expr
            };
        };
    }(config_types);
var getPrimary__index = function (getLiteral, getReference, getBracketedExpression) {
        
        return function (tokenizer) {
            return getLiteral(tokenizer) || getReference(tokenizer) || getBracketedExpression(tokenizer);
        };
    }(getLiteral__index, getPrimary_getReference, getPrimary_getBracketedExpression);
var shared_getRefinement = function (types, getName) {
        
        return function getRefinement(tokenizer) {
            var start, name, expr;
            start = tokenizer.pos;
            tokenizer.allowWhitespace();
            if (tokenizer.getStringMatch('.')) {
                tokenizer.allowWhitespace();
                if (name = getName(tokenizer)) {
                    return {
                        t: types.REFINEMENT,
                        n: name
                    };
                }
                tokenizer.expected('a property name');
            }
            if (tokenizer.getStringMatch('[')) {
                tokenizer.allowWhitespace();
                expr = tokenizer.getExpression();
                if (!expr) {
                    tokenizer.expected('an expression');
                }
                tokenizer.allowWhitespace();
                if (!tokenizer.getStringMatch(']')) {
                    tokenizer.expected('"]"');
                }
                return {
                    t: types.REFINEMENT,
                    x: expr
                };
            }
            return null;
        };
    }(config_types, shared_getName);
var getExpression_getMemberOrInvocation = function (types, getPrimary, getExpressionList, getRefinement) {
        
        return function (tokenizer) {
            var current, expression, refinement, expressionList;
            expression = getPrimary(tokenizer);
            if (!expression) {
                return null;
            }
            while (expression) {
                current = tokenizer.pos;
                if (refinement = getRefinement(tokenizer)) {
                    expression = {
                        t: types.MEMBER,
                        x: expression,
                        r: refinement
                    };
                } else if (tokenizer.getStringMatch('(')) {
                    tokenizer.allowWhitespace();
                    expressionList = getExpressionList(tokenizer);
                    tokenizer.allowWhitespace();
                    if (!tokenizer.getStringMatch(')')) {
                        tokenizer.pos = current;
                        break;
                    }
                    expression = {
                        t: types.INVOCATION,
                        x: expression
                    };
                    if (expressionList) {
                        expression.o = expressionList;
                    }
                } else {
                    break;
                }
            }
            return expression;
        };
    }(config_types, getPrimary__index, shared_getExpressionList, shared_getRefinement);
var getExpression_getTypeOf = function (types, getMemberOrInvocation) {
        
        var getTypeOf, makePrefixSequenceMatcher;
        makePrefixSequenceMatcher = function (symbol, fallthrough) {
            return function (tokenizer) {
                var start, expression;
                if (!tokenizer.getStringMatch(symbol)) {
                    return fallthrough(tokenizer);
                }
                start = tokenizer.pos;
                tokenizer.allowWhitespace();
                expression = tokenizer.getExpression();
                if (!expression) {
                    tokenizer.expected('an expression');
                }
                return {
                    s: symbol,
                    o: expression,
                    t: types.PREFIX_OPERATOR
                };
            };
        };
        (function () {
            var i, len, matcher, prefixOperators, fallthrough;
            prefixOperators = '! ~ + - typeof'.split(' ');
            fallthrough = getMemberOrInvocation;
            for (i = 0, len = prefixOperators.length; i < len; i += 1) {
                matcher = makePrefixSequenceMatcher(prefixOperators[i], fallthrough);
                fallthrough = matcher;
            }
            getTypeOf = fallthrough;
        }());
        return getTypeOf;
    }(config_types, getExpression_getMemberOrInvocation);
var getExpression_getLogicalOr = function (types, getTypeOf) {
        
        var getLogicalOr, makeInfixSequenceMatcher;
        makeInfixSequenceMatcher = function (symbol, fallthrough) {
            return function (tokenizer) {
                var start, left, right;
                left = fallthrough(tokenizer);
                if (!left) {
                    return null;
                }
                start = tokenizer.pos;
                tokenizer.allowWhitespace();
                if (!tokenizer.getStringMatch(symbol)) {
                    tokenizer.pos = start;
                    return left;
                }
                if (symbol === 'in' && /[a-zA-Z_$0-9]/.test(tokenizer.remaining().charAt(0))) {
                    tokenizer.pos = start;
                    return left;
                }
                tokenizer.allowWhitespace();
                right = tokenizer.getExpression();
                if (!right) {
                    tokenizer.pos = start;
                    return left;
                }
                return {
                    t: types.INFIX_OPERATOR,
                    s: symbol,
                    o: [
                        left,
                        right
                    ]
                };
            };
        };
        (function () {
            var i, len, matcher, infixOperators, fallthrough;
            infixOperators = '* / % + - << >> >>> < <= > >= in instanceof == != === !== & ^ | && ||'.split(' ');
            fallthrough = getTypeOf;
            for (i = 0, len = infixOperators.length; i < len; i += 1) {
                matcher = makeInfixSequenceMatcher(infixOperators[i], fallthrough);
                fallthrough = matcher;
            }
            getLogicalOr = fallthrough;
        }());
        return getLogicalOr;
    }(config_types, getExpression_getTypeOf);
var getExpression_getConditional = function (types, getLogicalOr) {
        
        return function (tokenizer) {
            var start, expression, ifTrue, ifFalse;
            expression = getLogicalOr(tokenizer);
            if (!expression) {
                return null;
            }
            start = tokenizer.pos;
            tokenizer.allowWhitespace();
            if (!tokenizer.getStringMatch('?')) {
                tokenizer.pos = start;
                return expression;
            }
            tokenizer.allowWhitespace();
            ifTrue = tokenizer.getExpression();
            if (!ifTrue) {
                tokenizer.pos = start;
                return expression;
            }
            tokenizer.allowWhitespace();
            if (!tokenizer.getStringMatch(':')) {
                tokenizer.pos = start;
                return expression;
            }
            tokenizer.allowWhitespace();
            ifFalse = tokenizer.getExpression();
            if (!ifFalse) {
                tokenizer.pos = start;
                return expression;
            }
            return {
                t: types.CONDITIONAL,
                o: [
                    expression,
                    ifTrue,
                    ifFalse
                ]
            };
        };
    }(config_types, getExpression_getLogicalOr);
var getExpression__index = function (getConditional) {
        
        return function () {
            return getConditional(this);
        };
    }(getExpression_getConditional);
var utils_allowWhitespace = function () {
        
        var leadingWhitespace = /^\s+/;
        return function () {
            var match = leadingWhitespace.exec(this.remaining());
            if (!match) {
                return null;
            }
            this.pos += match[0].length;
            return match[0];
        };
    }();
var utils_getStringMatch = function () {
        
        return function (string) {
            var substr;
            substr = this.str.substr(this.pos, string.length);
            if (substr === string) {
                this.pos += string.length;
                return string;
            }
            return null;
        };
    }();
var Tokenizer__index = function (getMustache, getComment, getTag, getText, getExpression, allowWhitespace, getStringMatch) {
        
        var Tokenizer;
        Tokenizer = function (str, options) {
            var token;
            this.str = str;
            this.pos = 0;
            this.delimiters = options.delimiters;
            this.tripleDelimiters = options.tripleDelimiters;
            this.tokens = [];
            while (this.pos < this.str.length) {
                token = this.getToken();
                if (token === null && this.remaining()) {
                    this.fail();
                }
                this.tokens.push(token);
            }
        };
        Tokenizer.prototype = {
            getToken: function () {
                var token = this.getMustache() || this.getComment() || this.getTag() || this.getText();
                return token;
            },
            getMustache: getMustache,
            getComment: getComment,
            getTag: getTag,
            getText: getText,
            getExpression: getExpression,
            allowWhitespace: allowWhitespace,
            getStringMatch: getStringMatch,
            remaining: function () {
                return this.str.substring(this.pos);
            },
            fail: function () {
                var last20, next20;
                last20 = this.str.substr(0, this.pos).substr(-20);
                if (last20.length === 20) {
                    last20 = '...' + last20;
                }
                next20 = this.remaining().substr(0, 20);
                if (next20.length === 20) {
                    next20 = next20 + '...';
                }
                throw new Error('Could not parse template: ' + (last20 ? last20 + '<- ' : '') + 'failed at character ' + this.pos + ' ->' + next20);
            },
            expected: function (thing) {
                var remaining = this.remaining().substr(0, 40);
                if (remaining.length === 40) {
                    remaining += '...';
                }
                throw new Error('Tokenizer failed: unexpected string "' + remaining + '" (expected ' + thing + ')');
            }
        };
        return Tokenizer;
    }(getMustache__index, getComment_getComment, getTag__index, getText_getText, getExpression__index, utils_allowWhitespace, utils_getStringMatch);
var parse_tokenize = function (stripHtmlComments, stripStandalones, stripCommentTokens, Tokenizer) {
        
        var tokenize, Ractive;
        loadCircularDependency(function () {
            (function (dep) {
                Ractive = dep;
            }(Ractive__index));
        });
        tokenize = function (template, options) {
            var tokenizer, tokens;
            options = options || {};
            if (options.stripComments !== false) {
                template = stripHtmlComments(template);
            }
            tokenizer = new Tokenizer(template, {
                delimiters: options.delimiters || (Ractive ? Ractive.delimiters : [
                    '{{',
                    '}}'
                ]),
                tripleDelimiters: options.tripleDelimiters || (Ractive ? Ractive.tripleDelimiters : [
                    '{{{',
                    '}}}'
                ])
            });
            tokens = tokenizer.tokens;
            stripStandalones(tokens);
            stripCommentTokens(tokens);
            return tokens;
        };
        return tokenize;
    }(utils_stripHtmlComments, utils_stripStandalones, utils_stripCommentTokens, Tokenizer__index);
var TextStub__index = function (types) {
        
        var TextStub, htmlEntities, controlCharacters, namedEntityPattern, hexEntityPattern, decimalEntityPattern, validateCode, decodeCharacterReferences, whitespace;
        TextStub = function (token, preserveWhitespace) {
            this.text = preserveWhitespace ? token.value : token.value.replace(whitespace, ' ');
        };
        TextStub.prototype = {
            type: types.TEXT,
            toJSON: function () {
                return this.decoded || (this.decoded = decodeCharacterReferences(this.text));
            },
            toString: function () {
                return this.text;
            }
        };
        htmlEntities = {
            quot: 34,
            amp: 38,
            apos: 39,
            lt: 60,
            gt: 62,
            nbsp: 160,
            iexcl: 161,
            cent: 162,
            pound: 163,
            curren: 164,
            yen: 165,
            brvbar: 166,
            sect: 167,
            uml: 168,
            copy: 169,
            ordf: 170,
            laquo: 171,
            not: 172,
            shy: 173,
            reg: 174,
            macr: 175,
            deg: 176,
            plusmn: 177,
            sup2: 178,
            sup3: 179,
            acute: 180,
            micro: 181,
            para: 182,
            middot: 183,
            cedil: 184,
            sup1: 185,
            ordm: 186,
            raquo: 187,
            frac14: 188,
            frac12: 189,
            frac34: 190,
            iquest: 191,
            Agrave: 192,
            Aacute: 193,
            Acirc: 194,
            Atilde: 195,
            Auml: 196,
            Aring: 197,
            AElig: 198,
            Ccedil: 199,
            Egrave: 200,
            Eacute: 201,
            Ecirc: 202,
            Euml: 203,
            Igrave: 204,
            Iacute: 205,
            Icirc: 206,
            Iuml: 207,
            ETH: 208,
            Ntilde: 209,
            Ograve: 210,
            Oacute: 211,
            Ocirc: 212,
            Otilde: 213,
            Ouml: 214,
            times: 215,
            Oslash: 216,
            Ugrave: 217,
            Uacute: 218,
            Ucirc: 219,
            Uuml: 220,
            Yacute: 221,
            THORN: 222,
            szlig: 223,
            agrave: 224,
            aacute: 225,
            acirc: 226,
            atilde: 227,
            auml: 228,
            aring: 229,
            aelig: 230,
            ccedil: 231,
            egrave: 232,
            eacute: 233,
            ecirc: 234,
            euml: 235,
            igrave: 236,
            iacute: 237,
            icirc: 238,
            iuml: 239,
            eth: 240,
            ntilde: 241,
            ograve: 242,
            oacute: 243,
            ocirc: 244,
            otilde: 245,
            ouml: 246,
            divide: 247,
            oslash: 248,
            ugrave: 249,
            uacute: 250,
            ucirc: 251,
            uuml: 252,
            yacute: 253,
            thorn: 254,
            yuml: 255,
            OElig: 338,
            oelig: 339,
            Scaron: 352,
            scaron: 353,
            Yuml: 376,
            fnof: 402,
            circ: 710,
            tilde: 732,
            Alpha: 913,
            Beta: 914,
            Gamma: 915,
            Delta: 916,
            Epsilon: 917,
            Zeta: 918,
            Eta: 919,
            Theta: 920,
            Iota: 921,
            Kappa: 922,
            Lambda: 923,
            Mu: 924,
            Nu: 925,
            Xi: 926,
            Omicron: 927,
            Pi: 928,
            Rho: 929,
            Sigma: 931,
            Tau: 932,
            Upsilon: 933,
            Phi: 934,
            Chi: 935,
            Psi: 936,
            Omega: 937,
            alpha: 945,
            beta: 946,
            gamma: 947,
            delta: 948,
            epsilon: 949,
            zeta: 950,
            eta: 951,
            theta: 952,
            iota: 953,
            kappa: 954,
            lambda: 955,
            mu: 956,
            nu: 957,
            xi: 958,
            omicron: 959,
            pi: 960,
            rho: 961,
            sigmaf: 962,
            sigma: 963,
            tau: 964,
            upsilon: 965,
            phi: 966,
            chi: 967,
            psi: 968,
            omega: 969,
            thetasym: 977,
            upsih: 978,
            piv: 982,
            ensp: 8194,
            emsp: 8195,
            thinsp: 8201,
            zwnj: 8204,
            zwj: 8205,
            lrm: 8206,
            rlm: 8207,
            ndash: 8211,
            mdash: 8212,
            lsquo: 8216,
            rsquo: 8217,
            sbquo: 8218,
            ldquo: 8220,
            rdquo: 8221,
            bdquo: 8222,
            dagger: 8224,
            Dagger: 8225,
            bull: 8226,
            hellip: 8230,
            permil: 8240,
            prime: 8242,
            Prime: 8243,
            lsaquo: 8249,
            rsaquo: 8250,
            oline: 8254,
            frasl: 8260,
            euro: 8364,
            image: 8465,
            weierp: 8472,
            real: 8476,
            trade: 8482,
            alefsym: 8501,
            larr: 8592,
            uarr: 8593,
            rarr: 8594,
            darr: 8595,
            harr: 8596,
            crarr: 8629,
            lArr: 8656,
            uArr: 8657,
            rArr: 8658,
            dArr: 8659,
            hArr: 8660,
            forall: 8704,
            part: 8706,
            exist: 8707,
            empty: 8709,
            nabla: 8711,
            isin: 8712,
            notin: 8713,
            ni: 8715,
            prod: 8719,
            sum: 8721,
            minus: 8722,
            lowast: 8727,
            radic: 8730,
            prop: 8733,
            infin: 8734,
            ang: 8736,
            and: 8743,
            or: 8744,
            cap: 8745,
            cup: 8746,
            'int': 8747,
            there4: 8756,
            sim: 8764,
            cong: 8773,
            asymp: 8776,
            ne: 8800,
            equiv: 8801,
            le: 8804,
            ge: 8805,
            sub: 8834,
            sup: 8835,
            nsub: 8836,
            sube: 8838,
            supe: 8839,
            oplus: 8853,
            otimes: 8855,
            perp: 8869,
            sdot: 8901,
            lceil: 8968,
            rceil: 8969,
            lfloor: 8970,
            rfloor: 8971,
            lang: 9001,
            rang: 9002,
            loz: 9674,
            spades: 9824,
            clubs: 9827,
            hearts: 9829,
            diams: 9830
        };
        controlCharacters = [
            8364,
            129,
            8218,
            402,
            8222,
            8230,
            8224,
            8225,
            710,
            8240,
            352,
            8249,
            338,
            141,
            381,
            143,
            144,
            8216,
            8217,
            8220,
            8221,
            8226,
            8211,
            8212,
            732,
            8482,
            353,
            8250,
            339,
            157,
            382,
            376
        ];
        namedEntityPattern = new RegExp('&(' + Object.keys(htmlEntities).join('|') + ');?', 'g');
        hexEntityPattern = /&#x([0-9]+);?/g;
        decimalEntityPattern = /&#([0-9]+);?/g;
        validateCode = function (code) {
            if (!code) {
                return 65533;
            }
            if (code === 10) {
                return 32;
            }
            if (code < 128) {
                return code;
            }
            if (code <= 159) {
                return controlCharacters[code - 128];
            }
            if (code < 55296) {
                return code;
            }
            if (code <= 57343) {
                return 65533;
            }
            if (code <= 65535) {
                return code;
            }
            return 65533;
        };
        decodeCharacterReferences = function (html) {
            var result;
            result = html.replace(namedEntityPattern, function (match, name) {
                if (htmlEntities[name]) {
                    return String.fromCharCode(htmlEntities[name]);
                }
                return match;
            });
            result = result.replace(hexEntityPattern, function (match, hex) {
                return String.fromCharCode(validateCode(parseInt(hex, 16)));
            });
            result = result.replace(decimalEntityPattern, function (match, charCode) {
                return String.fromCharCode(validateCode(charCode));
            });
            return result;
        };
        whitespace = /\s+/g;
        return TextStub;
    }(config_types);
var getText__index = function (types, TextStub) {
        
        return function (token) {
            if (token.type === types.TEXT) {
                this.pos += 1;
                return new TextStub(token, this.preserveWhitespace);
            }
            return null;
        };
    }(config_types, TextStub__index);
var CommentStub__index = function (types) {
        
        var CommentStub;
        CommentStub = function (token) {
            this.content = token.content;
        };
        CommentStub.prototype = {
            toJSON: function () {
                return {
                    t: types.COMMENT,
                    f: this.content
                };
            },
            toString: function () {
                return '<!--' + this.content + '-->';
            }
        };
        return CommentStub;
    }(config_types);
var getComment__index = function (types, CommentStub) {
        
        return function (token) {
            if (token.type === types.COMMENT) {
                this.pos += 1;
                return new CommentStub(token, this.preserveWhitespace);
            }
            return null;
        };
    }(config_types, CommentStub__index);
var ExpressionStub__index = function (types, isObject) {
        
        var ExpressionStub, getRefs, stringify, stringifyKey, identifier;
        ExpressionStub = function (token) {
            this.refs = [];
            getRefs(token, this.refs);
            this.str = stringify(token, this.refs);
        };
        ExpressionStub.prototype = {
            toJSON: function () {
                if (this.json) {
                    return this.json;
                }
                this.json = {
                    r: this.refs,
                    s: this.str
                };
                return this.json;
            }
        };
        getRefs = function (token, refs) {
            var i, list;
            if (token.t === types.REFERENCE) {
                if (refs.indexOf(token.n) === -1) {
                    refs.unshift(token.n);
                }
            }
            list = token.o || token.m;
            if (list) {
                if (isObject(list)) {
                    getRefs(list, refs);
                } else {
                    i = list.length;
                    while (i--) {
                        getRefs(list[i], refs);
                    }
                }
            }
            if (token.x) {
                getRefs(token.x, refs);
            }
            if (token.r) {
                getRefs(token.r, refs);
            }
            if (token.v) {
                getRefs(token.v, refs);
            }
        };
        stringify = function (token, refs) {
            var map = function (item) {
                return stringify(item, refs);
            };
            switch (token.t) {
            case types.BOOLEAN_LITERAL:
            case types.GLOBAL:
            case types.NUMBER_LITERAL:
                return token.v;
            case types.STRING_LITERAL:
                return '\'' + token.v.replace(/'/g, '\\\'') + '\'';
            case types.ARRAY_LITERAL:
                return '[' + (token.m ? token.m.map(map).join(',') : '') + ']';
            case types.OBJECT_LITERAL:
                return '{' + (token.m ? token.m.map(map).join(',') : '') + '}';
            case types.KEY_VALUE_PAIR:
                return stringifyKey(token.k) + ':' + stringify(token.v, refs);
            case types.PREFIX_OPERATOR:
                return (token.s === 'typeof' ? 'typeof ' : token.s) + stringify(token.o, refs);
            case types.INFIX_OPERATOR:
                return stringify(token.o[0], refs) + (token.s.substr(0, 2) === 'in' ? ' ' + token.s + ' ' : token.s) + stringify(token.o[1], refs);
            case types.INVOCATION:
                return stringify(token.x, refs) + '(' + (token.o ? token.o.map(map).join(',') : '') + ')';
            case types.BRACKETED:
                return '(' + stringify(token.x, refs) + ')';
            case types.MEMBER:
                return stringify(token.x, refs) + stringify(token.r, refs);
            case types.REFINEMENT:
                return token.n ? '.' + token.n : '[' + stringify(token.x, refs) + ']';
            case types.CONDITIONAL:
                return stringify(token.o[0], refs) + '?' + stringify(token.o[1], refs) + ':' + stringify(token.o[2], refs);
            case types.REFERENCE:
                return '${' + refs.indexOf(token.n) + '}';
            default:
                throw new Error('Could not stringify expression token. This error is unexpected');
            }
        };
        stringifyKey = function (key) {
            if (key.t === types.STRING_LITERAL) {
                return identifier.test(key.v) ? key.v : '"' + key.v.replace(/"/g, '\\"') + '"';
            }
            if (key.t === types.NUMBER_LITERAL) {
                return key.v;
            }
            return key;
        };
        identifier = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;
        return ExpressionStub;
    }(config_types, utils_isObject);
var MustacheStub__index = function (types, ExpressionStub) {
        
        var MustacheStub = function (token, parser) {
            this.type = token.type === types.TRIPLE ? types.TRIPLE : token.mustacheType;
            if (token.ref) {
                this.ref = token.ref;
            }
            if (token.expression) {
                this.expr = new ExpressionStub(token.expression);
            }
            parser.pos += 1;
        };
        MustacheStub.prototype = {
            toJSON: function () {
                var json;
                if (this.json) {
                    return this.json;
                }
                json = { t: this.type };
                if (this.ref) {
                    json.r = this.ref;
                }
                if (this.expr) {
                    json.x = this.expr.toJSON();
                }
                this.json = json;
                return json;
            },
            toString: function () {
                return false;
            }
        };
        return MustacheStub;
    }(config_types, ExpressionStub__index);
var utils_stringifyStubs = function () {
        
        return function (items) {
            var str = '', itemStr, i, len;
            if (!items) {
                return '';
            }
            for (i = 0, len = items.length; i < len; i += 1) {
                itemStr = items[i].toString();
                if (itemStr === false) {
                    return false;
                }
                str += itemStr;
            }
            return str;
        };
    }();
var utils_jsonifyStubs = function (stringifyStubs) {
        
        return function (items, noStringify) {
            var str, json;
            if (!noStringify) {
                str = stringifyStubs(items);
                if (str !== false) {
                    return str;
                }
            }
            json = items.map(function (item) {
                return item.toJSON(noStringify);
            });
            return json;
        };
    }(utils_stringifyStubs);
var SectionStub__index = function (types, jsonifyStubs, ExpressionStub) {
        
        var SectionStub = function (firstToken, parser) {
            var next;
            this.ref = firstToken.ref;
            this.indexRef = firstToken.indexRef;
            this.inverted = firstToken.mustacheType === types.INVERTED;
            if (firstToken.expression) {
                this.expr = new ExpressionStub(firstToken.expression);
            }
            parser.pos += 1;
            this.items = [];
            next = parser.next();
            while (next) {
                if (next.mustacheType === types.CLOSING) {
                    if (next.ref.trim() === this.ref || this.expr) {
                        parser.pos += 1;
                        break;
                    } else {
                        throw new Error('Could not parse template: Illegal closing section');
                    }
                }
                this.items[this.items.length] = parser.getStub();
                next = parser.next();
            }
        };
        SectionStub.prototype = {
            toJSON: function (noStringify) {
                var json;
                if (this.json) {
                    return this.json;
                }
                json = { t: types.SECTION };
                if (this.ref) {
                    json.r = this.ref;
                }
                if (this.indexRef) {
                    json.i = this.indexRef;
                }
                if (this.inverted) {
                    json.n = true;
                }
                if (this.expr) {
                    json.x = this.expr.toJSON();
                }
                if (this.items.length) {
                    json.f = jsonifyStubs(this.items, noStringify);
                }
                this.json = json;
                return json;
            },
            toString: function () {
                return false;
            }
        };
        return SectionStub;
    }(config_types, utils_jsonifyStubs, ExpressionStub__index);
var getMustache__index = function (types, MustacheStub, SectionStub) {
        
        return function (token) {
            if (token.type === types.MUSTACHE || token.type === types.TRIPLE) {
                if (token.mustacheType === types.SECTION || token.mustacheType === types.INVERTED) {
                    return new SectionStub(token, this);
                }
                return new MustacheStub(token, this);
            }
        };
    }(config_types, MustacheStub__index, SectionStub__index);
var config_voidElementNames = function () {
        
        return 'area base br col command doctype embed hr img input keygen link meta param source track wbr'.split(' ');
    }();
var utils_siblingsByTagName = function () {
        
        return {
            li: ['li'],
            dt: [
                'dt',
                'dd'
            ],
            dd: [
                'dt',
                'dd'
            ],
            p: 'address article aside blockquote dir div dl fieldset footer form h1 h2 h3 h4 h5 h6 header hgroup hr menu nav ol p pre section table ul'.split(' '),
            rt: [
                'rt',
                'rp'
            ],
            rp: [
                'rp',
                'rt'
            ],
            optgroup: ['optgroup'],
            option: [
                'option',
                'optgroup'
            ],
            thead: [
                'tbody',
                'tfoot'
            ],
            tbody: [
                'tbody',
                'tfoot'
            ],
            tr: ['tr'],
            td: [
                'td',
                'th'
            ],
            th: [
                'td',
                'th'
            ]
        };
    }();
var utils_filterAttributes = function (isArray) {
        
        return function (items) {
            var attrs, proxies, filtered, i, len, item;
            filtered = {};
            attrs = [];
            proxies = [];
            len = items.length;
            for (i = 0; i < len; i += 1) {
                item = items[i];
                if (item.name === 'intro') {
                    if (filtered.intro) {
                        throw new Error('An element can only have one intro transition');
                    }
                    filtered.intro = item;
                } else if (item.name === 'outro') {
                    if (filtered.outro) {
                        throw new Error('An element can only have one outro transition');
                    }
                    filtered.outro = item;
                } else if (item.name === 'intro-outro') {
                    if (filtered.intro || filtered.outro) {
                        throw new Error('An element can only have one intro and one outro transition');
                    }
                    filtered.intro = item;
                    filtered.outro = deepClone(item);
                } else if (item.name.substr(0, 6) === 'proxy-') {
                    item.name = item.name.substring(6);
                    proxies[proxies.length] = item;
                } else if (item.name.substr(0, 3) === 'on-') {
                    item.name = item.name.substring(3);
                    proxies[proxies.length] = item;
                } else if (item.name === 'decorator') {
                    filtered.decorator = item;
                } else {
                    attrs[attrs.length] = item;
                }
            }
            filtered.attrs = attrs;
            filtered.proxies = proxies;
            return filtered;
        };
        function deepClone(obj) {
            var result, key;
            if (typeof obj !== 'object') {
                return obj;
            }
            if (isArray(obj)) {
                return obj.map(deepClone);
            }
            result = {};
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    result[key] = deepClone(obj[key]);
                }
            }
            return result;
        }
    }(utils_isArray);
var utils_processDirective = function (types) {
        
        return function (directive) {
            var processed, tokens, token, colonIndex, throwError, directiveName, directiveArgs;
            throwError = function () {
                throw new Error('Illegal directive');
            };
            if (!directive.name || !directive.value) {
                throwError();
            }
            processed = { directiveType: directive.name };
            tokens = directive.value;
            directiveName = [];
            directiveArgs = [];
            while (tokens.length) {
                token = tokens.shift();
                if (token.type === types.TEXT) {
                    colonIndex = token.value.indexOf(':');
                    if (colonIndex === -1) {
                        directiveName[directiveName.length] = token;
                    } else {
                        if (colonIndex) {
                            directiveName[directiveName.length] = {
                                type: types.TEXT,
                                value: token.value.substr(0, colonIndex)
                            };
                        }
                        if (token.value.length > colonIndex + 1) {
                            directiveArgs[0] = {
                                type: types.TEXT,
                                value: token.value.substring(colonIndex + 1)
                            };
                        }
                        break;
                    }
                } else {
                    directiveName[directiveName.length] = token;
                }
            }
            directiveArgs = directiveArgs.concat(tokens);
            if (directiveName.length === 1 && directiveName[0].type === types.TEXT) {
                processed.name = directiveName[0].value;
            } else {
                processed.name = directiveName;
            }
            if (directiveArgs.length) {
                if (directiveArgs.length === 1 && directiveArgs[0].type === types.TEXT) {
                    try {
                        processed.args = JSON.parse(directiveArgs[0].value);
                    } catch (err) {
                        processed.args = directiveArgs[0].value;
                    }
                } else {
                    processed.dynamicArgs = directiveArgs;
                }
            }
            return processed;
        };
    }(config_types);
var StringStub_StringParser = function (getText, getMustache) {
        
        var StringParser;
        StringParser = function (tokens, options) {
            var stub;
            this.tokens = tokens || [];
            this.pos = 0;
            this.options = options;
            this.result = [];
            while (stub = this.getStub()) {
                this.result.push(stub);
            }
        };
        StringParser.prototype = {
            getStub: function () {
                var token = this.next();
                if (!token) {
                    return null;
                }
                return this.getText(token) || this.getMustache(token);
            },
            getText: getText,
            getMustache: getMustache,
            next: function () {
                return this.tokens[this.pos];
            }
        };
        return StringParser;
    }(getText__index, getMustache__index);
var StringStub__index = function (StringParser, stringifyStubs, jsonifyStubs) {
        
        var StringStub;
        StringStub = function (tokens) {
            var parser = new StringParser(tokens);
            this.stubs = parser.result;
        };
        StringStub.prototype = {
            toJSON: function (noStringify) {
                var json;
                if (this['json_' + noStringify]) {
                    return this['json_' + noStringify];
                }
                json = this['json_' + noStringify] = jsonifyStubs(this.stubs, noStringify);
                return json;
            },
            toString: function () {
                if (this.str !== undefined) {
                    return this.str;
                }
                this.str = stringifyStubs(this.stubs);
                return this.str;
            }
        };
        return StringStub;
    }(StringStub_StringParser, utils_stringifyStubs, utils_jsonifyStubs);
var utils_jsonifyDirective = function (StringStub) {
        
        return function (directive) {
            var result, name;
            if (typeof directive.name === 'string') {
                if (!directive.args && !directive.dynamicArgs) {
                    return directive.name;
                }
                name = directive.name;
            } else {
                name = new StringStub(directive.name).toJSON();
            }
            result = { n: name };
            if (directive.args) {
                result.a = directive.args;
                return result;
            }
            if (directive.dynamicArgs) {
                result.d = new StringStub(directive.dynamicArgs).toJSON();
            }
            return result;
        };
    }(StringStub__index);
var ElementStub_toJSON = function (types, jsonifyStubs, jsonifyDirective) {
        
        return function (noStringify) {
            var json, name, value, proxy, i, len, attribute;
            if (this['json_' + noStringify]) {
                return this['json_' + noStringify];
            }
            if (this.component) {
                json = {
                    t: types.COMPONENT,
                    e: this.component
                };
            } else {
                json = {
                    t: types.ELEMENT,
                    e: this.tag
                };
            }
            if (this.doctype) {
                json.y = 1;
            }
            if (this.attributes && this.attributes.length) {
                json.a = {};
                len = this.attributes.length;
                for (i = 0; i < len; i += 1) {
                    attribute = this.attributes[i];
                    name = attribute.name;
                    if (json.a[name]) {
                        throw new Error('You cannot have multiple attributes with the same name');
                    }
                    if (attribute.value === null) {
                        value = null;
                    } else {
                        value = attribute.value.toJSON(noStringify);
                    }
                    json.a[name] = value;
                }
            }
            if (this.items && this.items.length) {
                json.f = jsonifyStubs(this.items, noStringify);
            }
            if (this.proxies && this.proxies.length) {
                json.v = {};
                len = this.proxies.length;
                for (i = 0; i < len; i += 1) {
                    proxy = this.proxies[i];
                    json.v[proxy.directiveType] = jsonifyDirective(proxy);
                }
            }
            if (this.intro) {
                json.t1 = jsonifyDirective(this.intro);
            }
            if (this.outro) {
                json.t2 = jsonifyDirective(this.outro);
            }
            if (this.decorator) {
                json.o = this.decorator;
            }
            this['json_' + noStringify] = json;
            return json;
        };
    }(config_types, utils_jsonifyStubs, utils_jsonifyDirective);
var ElementStub_toString = function (stringifyStubs, voidElementNames) {
        
        var htmlElements;
        htmlElements = 'a abbr acronym address applet area b base basefont bdo big blockquote body br button caption center cite code col colgroup dd del dfn dir div dl dt em fieldset font form frame frameset h1 h2 h3 h4 h5 h6 head hr html i iframe img input ins isindex kbd label legend li link map menu meta noframes noscript object ol p param pre q s samp script select small span strike strong style sub sup textarea title tt u ul var article aside audio bdi canvas command data datagrid datalist details embed eventsource figcaption figure footer header hgroup keygen mark meter nav output progress ruby rp rt section source summary time track video wbr'.split(' ');
        return function () {
            var str, i, len, attrStr, name, attrValueStr, fragStr, isVoid;
            if (this.str !== undefined) {
                return this.str;
            }
            if (this.component) {
                return this.str = false;
            }
            if (htmlElements.indexOf(this.tag.toLowerCase()) === -1) {
                return this.str = false;
            }
            if (this.proxies || this.intro || this.outro) {
                return this.str = false;
            }
            fragStr = stringifyStubs(this.items);
            if (fragStr === false) {
                return this.str = false;
            }
            isVoid = voidElementNames.indexOf(this.tag.toLowerCase()) !== -1;
            str = '<' + this.tag;
            if (this.attributes) {
                for (i = 0, len = this.attributes.length; i < len; i += 1) {
                    name = this.attributes[i].name;
                    if (name.indexOf(':') !== -1) {
                        return this.str = false;
                    }
                    if (name === 'id' || name === 'intro' || name === 'outro') {
                        return this.str = false;
                    }
                    attrStr = ' ' + name;
                    if (this.attributes[i].value !== null) {
                        attrValueStr = this.attributes[i].value.toString();
                        if (attrValueStr === false) {
                            return this.str = false;
                        }
                        if (attrValueStr !== '') {
                            attrStr += '=';
                            if (/[\s"'=<>`]/.test(attrValueStr)) {
                                attrStr += '"' + attrValueStr.replace(/"/g, '&quot;') + '"';
                            } else {
                                attrStr += attrValueStr;
                            }
                        }
                    }
                    str += attrStr;
                }
            }
            if (this.selfClosing && !isVoid) {
                str += '/>';
                return this.str = str;
            }
            str += '>';
            if (isVoid) {
                return this.str = str;
            }
            str += fragStr;
            str += '</' + this.tag + '>';
            return this.str = str;
        };
    }(utils_stringifyStubs, config_voidElementNames);
var ElementStub__index = function (types, voidElementNames, stringifyStubs, siblingsByTagName, filterAttributes, processDirective, toJSON, toString, StringStub) {
        
        var ElementStub, allElementNames, mapToLowerCase, svgCamelCaseElements, svgCamelCaseElementsMap, svgCamelCaseAttributes, svgCamelCaseAttributesMap, closedByParentClose, onPattern, sanitize, camelCase, leadingWhitespace = /^\s+/, trailingWhitespace = /\s+$/;
        ElementStub = function (firstToken, parser, preserveWhitespace) {
            var next, attrs, filtered, proxies, item, i, attr, getFrag;
            this.lcTag = firstToken.name.toLowerCase();
            parser.pos += 1;
            getFrag = function (attr) {
                var lcName = attr.name.toLowerCase();
                return {
                    name: svgCamelCaseAttributesMap[lcName] ? svgCamelCaseAttributesMap[lcName] : lcName,
                    value: attr.value ? new StringStub(attr.value) : null
                };
            };
            if (this.lcTag.substr(0, 3) === 'rv-') {
                this.component = camelCase(firstToken.name.substring(3));
                if (firstToken.attrs) {
                    this.attributes = [];
                    i = firstToken.attrs.length;
                    while (i--) {
                        attr = firstToken.attrs[i];
                        this.attributes[i] = {
                            name: attr.name,
                            value: attr.value ? new StringStub(attr.value) : null
                        };
                    }
                }
            } else {
                this.tag = svgCamelCaseElementsMap[this.lcTag] ? svgCamelCaseElementsMap[this.lcTag] : this.lcTag;
                preserveWhitespace = preserveWhitespace || this.lcTag === 'pre';
                if (firstToken.attrs) {
                    filtered = filterAttributes(firstToken.attrs);
                    attrs = filtered.attrs;
                    proxies = filtered.proxies;
                    if (parser.options.sanitize && parser.options.sanitize.eventAttributes) {
                        attrs = attrs.filter(sanitize);
                    }
                    if (attrs.length) {
                        this.attributes = attrs.map(getFrag);
                    }
                    if (proxies.length) {
                        this.proxies = proxies.map(processDirective);
                    }
                    if (filtered.intro) {
                        this.intro = processDirective(filtered.intro);
                    }
                    if (filtered.outro) {
                        this.outro = processDirective(filtered.outro);
                    }
                    if (filtered.decorator) {
                        this.decorator = filtered.decorator.value[0].value;
                    }
                }
            }
            if (firstToken.doctype) {
                this.doctype = true;
            }
            if (firstToken.selfClosing) {
                this.selfClosing = true;
            }
            if (voidElementNames.indexOf(this.lcTag) !== -1) {
                this.isVoid = true;
            }
            if (this.selfClosing || this.isVoid) {
                return;
            }
            this.siblings = siblingsByTagName[this.lcTag];
            this.items = [];
            next = parser.next();
            while (next) {
                if (next.mustacheType === types.CLOSING) {
                    break;
                }
                if (next.type === types.TAG) {
                    if (next.closing) {
                        if (next.name.toLowerCase() === this.lcTag) {
                            parser.pos += 1;
                        }
                        break;
                    } else if (this.siblings && this.siblings.indexOf(next.name.toLowerCase()) !== -1) {
                        break;
                    }
                }
                this.items[this.items.length] = parser.getStub();
                next = parser.next();
            }
            if (!preserveWhitespace) {
                item = this.items[0];
                if (item && item.type === types.TEXT) {
                    item.text = item.text.replace(leadingWhitespace, '');
                    if (!item.text) {
                        this.items.shift();
                    }
                }
                item = this.items[this.items.length - 1];
                if (item && item.type === types.TEXT) {
                    item.text = item.text.replace(trailingWhitespace, '');
                    if (!item.text) {
                        this.items.pop();
                    }
                }
            }
        };
        ElementStub.prototype = {
            toJSON: toJSON,
            toString: toString
        };
        allElementNames = 'a abbr acronym address applet area b base basefont bdo big blockquote body br button caption center cite code col colgroup dd del dfn dir div dl dt em fieldset font form frame frameset h1 h2 h3 h4 h5 h6 head hr html i iframe img input ins isindex kbd label legend li link map menu meta noframes noscript object ol p param pre q s samp script select small span strike strong style sub sup textarea title tt u ul var article aside audio bdi canvas command data datagrid datalist details embed eventsource figcaption figure footer header hgroup keygen mark meter nav output progress ruby rp rt section source summary time track video wbr'.split(' ');
        closedByParentClose = 'li dd rt rp optgroup option tbody tfoot tr td th'.split(' ');
        svgCamelCaseElements = 'altGlyph altGlyphDef altGlyphItem animateColor animateMotion animateTransform clipPath feBlend feColorMatrix feComponentTransfer feComposite feConvolveMatrix feDiffuseLighting feDisplacementMap feDistantLight feFlood feFuncA feFuncB feFuncG feFuncR feGaussianBlur feImage feMerge feMergeNode feMorphology feOffset fePointLight feSpecularLighting feSpotLight feTile feTurbulence foreignObject glyphRef linearGradient radialGradient textPath vkern'.split(' ');
        svgCamelCaseAttributes = 'attributeName attributeType baseFrequency baseProfile calcMode clipPathUnits contentScriptType contentStyleType diffuseConstant edgeMode externalResourcesRequired filterRes filterUnits glyphRef glyphRef gradientTransform gradientTransform gradientUnits gradientUnits kernelMatrix kernelUnitLength kernelUnitLength kernelUnitLength keyPoints keySplines keyTimes lengthAdjust limitingConeAngle markerHeight markerUnits markerWidth maskContentUnits maskUnits numOctaves pathLength patternContentUnits patternTransform patternUnits pointsAtX pointsAtY pointsAtZ preserveAlpha preserveAspectRatio primitiveUnits refX refY repeatCount repeatDur requiredExtensions requiredFeatures specularConstant specularExponent specularExponent spreadMethod spreadMethod startOffset stdDeviation stitchTiles surfaceScale surfaceScale systemLanguage tableValues targetX targetY textLength textLength viewBox viewTarget xChannelSelector yChannelSelector zoomAndPan'.split(' ');
        mapToLowerCase = function (items) {
            var map = {}, i = items.length;
            while (i--) {
                map[items[i].toLowerCase()] = items[i];
            }
            return map;
        };
        svgCamelCaseElementsMap = mapToLowerCase(svgCamelCaseElements);
        svgCamelCaseAttributesMap = mapToLowerCase(svgCamelCaseAttributes);
        onPattern = /^on[a-zA-Z]/;
        sanitize = function (attr) {
            var valid = !onPattern.test(attr.name);
            return valid;
        };
        camelCase = function (hyphenatedStr) {
            return hyphenatedStr.replace(/-([a-zA-Z])/g, function (match, $1) {
                return $1.toUpperCase();
            });
        };
        return ElementStub;
    }(config_types, config_voidElementNames, utils_stringifyStubs, utils_siblingsByTagName, utils_filterAttributes, utils_processDirective, ElementStub_toJSON, ElementStub_toString, StringStub__index);
var getElement__index = function (types, ElementStub) {
        
        return function (token) {
            if (this.options.sanitize && this.options.sanitize.elements) {
                if (this.options.sanitize.elements.indexOf(token.name.toLowerCase()) !== -1) {
                    return null;
                }
            }
            return new ElementStub(token, this);
        };
    }(config_types, ElementStub__index);
var Parser__index = function (getText, getComment, getMustache, getElement, jsonifyStubs) {
        
        var Parser;
        Parser = function (tokens, options) {
            var stub, stubs;
            this.tokens = tokens || [];
            this.pos = 0;
            this.options = options;
            this.preserveWhitespace = options.preserveWhitespace;
            stubs = [];
            while (stub = this.getStub()) {
                stubs.push(stub);
            }
            this.result = jsonifyStubs(stubs);
        };
        Parser.prototype = {
            getStub: function () {
                var token = this.next();
                if (!token) {
                    return null;
                }
                return this.getText(token) || this.getComment(token) || this.getMustache(token) || this.getElement(token);
            },
            getText: getText,
            getComment: getComment,
            getMustache: getMustache,
            getElement: getElement,
            next: function () {
                return this.tokens[this.pos];
            }
        };
        return Parser;
    }(getText__index, getComment__index, getMustache__index, getElement__index, utils_jsonifyStubs);
var parse_parseTokens = function (Parser) {
        
        return function (tokens, options) {
            var parser = new Parser(tokens, options);
            return parser.result;
        };
    }(Parser__index);
var parse__index = function (tokenize, types, parseTokens) {
        
        var parse, onlyWhitespace, inlinePartialStart, inlinePartialEnd, parseCompoundTemplate;
        onlyWhitespace = /^\s*$/;
        inlinePartialStart = /<!--\s*\{\{\s*>\s*([a-zA-Z_$][a-zA-Z_$0-9]*)\s*}\}\s*-->/;
        inlinePartialEnd = /<!--\s*\{\{\s*\/\s*([a-zA-Z_$][a-zA-Z_$0-9]*)\s*}\}\s*-->/;
        parse = function (template, options) {
            var tokens, json, token;
            options = options || {};
            if (inlinePartialStart.test(template)) {
                return parseCompoundTemplate(template, options);
            }
            if (options.sanitize === true) {
                options.sanitize = {
                    elements: 'applet base basefont body frame frameset head html isindex link meta noframes noscript object param script style title'.split(' '),
                    eventAttributes: true
                };
            }
            tokens = tokenize(template, options);
            if (!options.preserveWhitespace) {
                token = tokens[0];
                if (token && token.type === types.TEXT && onlyWhitespace.test(token.value)) {
                    tokens.shift();
                }
                token = tokens[tokens.length - 1];
                if (token && token.type === types.TEXT && onlyWhitespace.test(token.value)) {
                    tokens.pop();
                }
            }
            json = parseTokens(tokens, options);
            if (typeof json === 'string') {
                return [json];
            }
            return json;
        };
        parseCompoundTemplate = function (template, options) {
            var mainTemplate, remaining, partials, name, startMatch, endMatch;
            partials = {};
            mainTemplate = '';
            remaining = template;
            while (startMatch = inlinePartialStart.exec(remaining)) {
                name = startMatch[1];
                mainTemplate += remaining.substr(0, startMatch.index);
                remaining = remaining.substring(startMatch.index + startMatch[0].length);
                endMatch = inlinePartialEnd.exec(remaining);
                if (!endMatch || endMatch[1] !== name) {
                    throw new Error('Inline partials must have a closing delimiter, and cannot be nested');
                }
                partials[name] = parse(remaining.substr(0, endMatch.index), options);
                remaining = remaining.substring(endMatch.index + endMatch[0].length);
            }
            return {
                main: parse(mainTemplate, options),
                partials: partials
            };
        };
        return parse;
    }(parse_tokenize, config_types, parse_parseTokens);
var static_extend = function (errors, create, isClient, isObject, parse) {
        
        var extend, Ractive, fillGaps, clone, augment, inheritFromParent, wrapMethod, inheritFromChildProps, conditionallyParseTemplate, extractInlinePartials, conditionallyParsePartials, initChildInstance, extendable, inheritable, blacklist;
        loadCircularDependency(function () {
            (function (dep) {
                Ractive = dep;
            }(Ractive__index));
        });
        extend = function (childProps) {
            var Parent = this, Child;
            Child = function (options) {
                initChildInstance(this, Child, options || {});
            };
            Child.prototype = create(Parent.prototype);
            if (Parent !== Ractive) {
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
        blacklist = extendable.concat(inheritable);
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
                if (childProps.hasOwnProperty(key) && !Child.prototype.hasOwnProperty(key) && blacklist.indexOf(key) === -1) {
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
            Ractive.call(child, options);
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
    }(config_errors, utils_create, config_isClient, utils_isObject, parse__index);
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
        
        var updateSection, DomFragment, updateListSection, updateListObjectSection, updateContextSection, updateConditionalSection;
        loadCircularDependency(function () {
            (function (dep) {
                DomFragment = dep;
            }(DomFragment__index));
        });
        updateSection = function (section, value) {
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
        updateListSection = function (section, value, fragmentOptions) {
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
        };
        updateListObjectSection = function (section, value, fragmentOptions) {
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
        };
        updateContextSection = function (section, fragmentOptions) {
            if (!section.length) {
                fragmentOptions.contextStack = section.contextStack.concat(section.keypath);
                fragmentOptions.index = 0;
                section.fragments[0] = section.createFragment(fragmentOptions);
                section.length = 1;
            }
        };
        updateConditionalSection = function (section, value, inverted, fragmentOptions) {
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
        };
        return updateSection;
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
var Attribute_bindAttribute = function (types, warn, arrayContentsMatch, getValueFromCheckboxes) {
        
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
    }(config_types, utils_warn, utils_arrayContentsMatch, shared_getValueFromCheckboxes);
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
            this.value = value;
            options = this.parentNode.options;
            i = options.length;
            while (i--) {
                option = options[i];
                if (option._ractive.value === value) {
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
            if (partial = getPartialFromRegistry(root, name)) {
                return partial;
            }
            if (isClient) {
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
                    return null;
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
var Ractive_initialise = function (isClient, errors, warn, create, extend, defineProperties, getElement, isObject, render, magicAdaptor) {
        
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
            'adaptors',
            'components',
            'decorators',
            'events',
            'transitions'
        ];
        return function (ractive, options, Ractive) {
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
                ractive[registry] = extend(create(Ractive[registry]), options[registry]);
            });
            template = options.template;
            if (typeof template === 'string') {
                if (!Ractive.parse) {
                    throw new Error(errors.missingParser);
                }
                if (template.charAt(0) === '#' && isClient) {
                    templateEl = document.getElementById(template.substring(1));
                    if (templateEl) {
                        parsedTemplate = Ractive.parse(templateEl.innerHTML, options);
                    } else {
                        throw new Error('Could not find template element (' + template + ')');
                    }
                } else {
                    parsedTemplate = Ractive.parse(template, options);
                }
            } else {
                parsedTemplate = template;
            }
            ractive.partials = create(Ractive.partials);
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
                sanitize: options.sanitize
            };
            ractive.transitionsEnabled = options.noIntro ? false : options.transitionsEnabled;
            render(ractive, {
                el: ractive.el,
                append: options.append,
                complete: options.complete
            });
            ractive.transitionsEnabled = options.transitionsEnabled;
        };
    }(config_isClient, config_errors, utils_warn, utils_create, utils_extend, utils_defineProperties, utils_getElement, utils_isObject, shared_render, get_magicAdaptor);
var Ractive__index = function (create, defineProperties, prototype, partials, easing, Ractive_extend, interpolate, interpolators, parse, initialise) {
        
        var Ractive = function (options) {
            initialise(this, options, Ractive);
        };
        Ractive.prototype = prototype;
        Ractive.partials = partials;
        Ractive.delimiters = [
            '{{',
            '}}'
        ];
        Ractive.tripleDelimiters = [
            '{{{',
            '}}}'
        ];
        Ractive.adaptors = {};
        Ractive.transitions = {};
        Ractive.events = Ractive.eventDefinitions = {};
        Ractive.easing = easing;
        Ractive.components = {};
        Ractive.decorators = {};
        Ractive.extend = Ractive_extend;
        Ractive.interpolate = interpolate;
        Ractive.interpolators = interpolators;
        Ractive.parse = parse;
        Ractive.VERSION = '0.3.8-pre';
        return Ractive;
    }(utils_create, utils_defineProperties, prototype__index, registries_partials, static_easing, static_extend, static_interpolate, static_interpolators, parse__index, Ractive_initialise);
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