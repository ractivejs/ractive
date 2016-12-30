/**
 * QUnit-TAP - A TAP Output Producer Plugin for QUnit
 *
 * https://github.com/twada/qunit-tap
 * version: 1.3.1pre
 *
 * Copyright (c) 2010-2013 Takuto Wada
 * Dual licensed under the MIT and GPLv2 licenses.
 *   https://raw.github.com/twada/qunit-tap/master/MIT-LICENSE.txt
 *   https://raw.github.com/twada/qunit-tap/master/GPL-LICENSE.txt
 *
 * A part of extend function is:
 *   Copyright 2012 jQuery Foundation and other contributors
 *   Released under the MIT license.
 *   http://jquery.org/license
 *
 * A part of stripTags function is:
 *   Copyright (c) 2005-2010 Sam Stephenson
 *   Released under the MIT license.
 *   http://prototypejs.org
 *
 * @param qunitObject QUnit object reference.
 * @param printLikeFunction print-like function for TAP output (assumes line-separator is added by this function for each call).
 * @param options configuration options to customize default behavior.
 * @return object to provide QUnit-TAP API and customization subject.
 */
var qunitTap = function qunitTap(qunitObject, printLikeFunction, options) {
    'use strict';
    var qunitTapVersion = '1.3.1pre',
        detailsExtractor,
        tap = {},
        qu = qunitObject;

    if (!qu) {
        throw new Error('should pass QUnit object reference. Please check QUnit\'s "require" path if you are using Node.js (or any CommonJS env).');
    }
    if (typeof printLikeFunction !== 'function') {
        throw new Error('should pass print-like function');
    }

    // borrowed from qunit.js
    var extend = function (a, b) {
        var prop;
        for (prop in b) {
            if (b.hasOwnProperty(prop)) {
                if (typeof b[prop] === 'undefined') {
                    delete a[prop];
                } else {
                    a[prop] = b[prop];
                }
            }
        }
        return a;
    };

    // option deprecation and fallback function
    var deprecateOption = function (optionName, fallback) {
        if (!options || typeof options !== 'object') {
            return;
        }
        if (typeof options[optionName] === 'undefined') {
            return;
        }
        printLikeFunction('# WARNING: Option "' + optionName + '" is deprecated and will be removed in future version.');
        fallback(options[optionName]);
    };

    tap.config = extend(
        {
            initialCount: 1,
            showModuleNameOnFailure: true,
            showTestNameOnFailure: true,
            showExpectationOnFailure: true,
            showSourceOnFailure: true
        },
        options
    );
    deprecateOption('noPlan', function (flag) {
        printLikeFunction('# Now QUnit-TAP works as with "noPlan: true" by default. If you want to delare plan explicitly, please use "QUnit.config.requireExpects" option instead.');
        tap.config.noPlan = flag;
    });
    deprecateOption('count', function (count) {
        tap.config.initialCount = (count + 1);
    });
    deprecateOption('showDetailsOnFailure', function (flag) {
        tap.config.showModuleNameOnFailure = flag;
        tap.config.showTestNameOnFailure = flag;
        tap.config.showExpectationOnFailure = flag;
        tap.config.showSourceOnFailure = flag;
    });
    tap.VERSION = qunitTapVersion;
    tap.puts = printLikeFunction;
    tap.count = tap.config.initialCount - 1;
    tap.expectedCount = tap.config.initialCount - 1;

    var isPlanRequired = function (conf) {
        return (typeof conf !== 'undefined' && typeof conf.requireExpects !== 'undefined' && conf.requireExpects);
    };

    var isPassed = function (details) {
        return !!(details.result);
    };

    var isFailed = function (details) {
        return !(isPassed(details));
    };

    var isAssertOkFailed = function (details) {
        return isFailed(details) && typeof details.expected === 'undefined' && typeof details.actual === 'undefined';
    };

    // borrowed from prototype.js
    // not required since QUnit.log receives raw data (details). see jquery/qunit@c2cde34
    var stripTags = function (str) {
        if (!str) {
            return str;
        }
        return str.replace(/<\w+(\s+("[^"]*"|'[^']*'|[^>])+)?>|<\/\w+>/gi, '');
    };

    var escapeLineEndings = function (str) {
        return str.replace(/(\r?\n)/g, '$&# ');
    };

    var ltrim = function (str) {
        return str.replace(/^\s+/, '');
    };

    var quote = function (obj) {
        return '\'' + obj + '\'';
    };

    var noop = function (obj) {
        return obj;
    };

    var explain = noop;
    if (typeof qu.jsDump !== 'undefined' && typeof qu.jsDump.parse === 'function') {
        explain = function (obj) {
            return qu.jsDump.parse(obj);
        };
    }

    var render = function (desc, fieldName, fieldValue, formatter) {
        desc.push(fieldName + ': ' + formatter(fieldValue));
    };

    var renderIf = function (configName, desc, fieldName, fieldValue, formatter) {
        if (!tap.config[configName] || typeof fieldValue === 'undefined') {
            return;
        }
        render(desc, fieldName, fieldValue, formatter);
    };

    var formatDetails = function (details) {
        if (isPassed(details)) {
            return details.message;
        }
        var desc = [];
        if (details.message) {
            desc.push(details.message);
        }
        if (tap.config.showExpectationOnFailure && !(isAssertOkFailed(details))) {
            render(desc, 'expected', details.expected, explain);
            render(desc, 'got', details.actual, explain);
        }
        renderIf('showTestNameOnFailure', desc, 'test', details.name, noop);
        renderIf('showModuleNameOnFailure', desc, 'module', details.module, noop);
        renderIf('showSourceOnFailure', desc, 'source', details.source, ltrim);
        return desc.join(', ');
    };

    var formatTestLine = function (testLine, rest) {
        if (!rest) {
            return testLine;
        }
        return testLine + ' - ' + escapeLineEndings(rest);
    };

    var setupExtractor = function (logArguments) {
        switch (logArguments.length) {
        case 1:  // details
            detailsExtractor = function (args) { return args[0]; };
            break;
        case 2:  // result, message(with tags)
            detailsExtractor = function (args) { return {result: args[0], message: stripTags(args[1])}; };
            break;
        case 3:  // result, message, details
            detailsExtractor = function (args) { return args[2]; };
            break;
        default:
            throw new Error('QUnit-TAP does not support QUnit#log arguments like this.');
        }
    };

    var extractDetailsFrom = function (logArguments) {
        if (detailsExtractor) {
            return detailsExtractor(logArguments);
        }
        setupExtractor(logArguments);
        return detailsExtractor(logArguments);
    };

    var printPlanLine = function (toCount) {
        tap.puts(tap.config.initialCount + '..' + toCount);
    };

    tap.explain = explain;

    tap.note = function note (obj) {
        tap.puts(escapeLineEndings('# ' + obj));
    };

    tap.diag = function diag (obj) {
        tap.note(obj);
        return false;
    };

    tap.moduleStart = function moduleStart (arg) {
        var name = (typeof arg === 'string') ? arg : arg.name;
        tap.note('module: ' + name);
    };

    tap.testStart = function testStart (arg) {
        var name = (typeof arg === 'string') ? arg : arg.name;
        tap.note('test: ' + name);
    };

    tap.log = function log () {
        var details = extractDetailsFrom(arguments),
            testLine = '';
        tap.count += 1;
        if (isFailed(details)) {
            testLine += 'not ';
        }
        testLine += ('ok ' + tap.count);
        tap.puts(formatTestLine(testLine, formatDetails(details)));
    };

    // prop in arg: name,module,failed,passed,total
    tap.testDone = function testDone (arg) {
        if (isPlanRequired(qu.config)) {
            tap.expectedCount += qu.config.current.expected;
        }
    };

    // prop in arg: failed,passed,total,runtime
    tap.done = function done (arg) {
        if (typeof tap.config.noPlan !== 'undefined' && !(tap.config.noPlan)) {
            // Do nothing until removal of 'noPlan' option.
        } else if (isPlanRequired(qu.config)) {
            printPlanLine(tap.expectedCount);
        } else {
            printPlanLine(tap.count);
        }
    };

    var addListener = function (config) {
        // detect QUnit's multipleCallbacks feature. see jquery/qunit@34f6bc1
        var isMultipleLoggingCallbacksSupported =
                (typeof config !== 'undefined' &&
                 typeof config.log !== 'undefined' &&
                 typeof config.done !== 'undefined' &&
                 typeof config.testDone !== 'undefined' &&
                 typeof config.moduleStart !== 'undefined' &&
                 typeof config.testStart !== 'undefined'),
            slice = Array.prototype.slice;
        return function (subject, observer, event) {
            var originalLoggingCallback = subject[event];
            if (isMultipleLoggingCallbacksSupported) {
                originalLoggingCallback(function () {
                    // make listener methods (moduleStart,testStart,log, ...) overridable.
                    observer[event].apply(observer, slice.apply(arguments));
                });
            } else if (typeof originalLoggingCallback === 'function') {
                // do not overwrite old-style logging callbacks
                subject[event] = function () {
                    var args = slice.apply(arguments);
                    originalLoggingCallback.apply(subject, args);
                    observer[event].apply(observer, args);
                };
            }
        };
    }(qu.config);
    addListener(qu, tap, 'moduleStart');
    addListener(qu, tap, 'testStart');
    addListener(qu, tap, 'log');
    addListener(qu, tap, 'testDone');
    addListener(qu, tap, 'done');

    return tap;
};

/*global exports:false*/
if (typeof exports !== 'undefined') {
    // exports qunitTap function to CommonJS world
    exports.qunitTap = qunitTap;
}