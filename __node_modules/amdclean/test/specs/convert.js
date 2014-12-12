require('jasmine-only');
describe('amdclean specs', function() {
	var amdclean = module.require('../../src/amdclean');

	describe('define() method conversions', function() {

		describe('functions', function() {

			it('should convert function return values to immediately invoked function declarations', function() {
				var AMDcode = "define('example', [], function() {});",
					cleanedCode = amdclean.clean({ code: AMDcode, escodegen: { format: { compact: true } } }),
					standardJavaScript = "var example=undefined;";

				expect(cleanedCode).toBe(standardJavaScript);
			});

			it('should preserve single line comments when converting function return values to immediately invoked function declarations', function() {
				var AMDcode = "define('example', [], function() {  // Answer\n var test = true; return test; });",
					cleanedCode = amdclean.clean({ code: AMDcode, escodegen: { format: { compact: true } } }),
					standardJavaScript = "var example=function (){// Answer\nvar test=true;return test;}();";

				expect(cleanedCode).toBe(standardJavaScript);
			});

			it('should preserve multi-line comments when converting function return values to immediately invoked function declarations', function() {
				var AMDcode = "define('example', [], function() {  /* Answer */\nvar test = true; return test; });",
					cleanedCode = amdclean.clean({ code: AMDcode, escodegen: { format: { compact: true } } }),
					standardJavaScript = "var example=function (){/* Answer */\nvar test=true;return test;}();";

				expect(cleanedCode).toBe(standardJavaScript);
			});

			it('should preserve single line comments when converting function return values to immediately invoked function declarations using the globalObject option', function() {
				var AMDcode = "define('example', [], function() {  // Answer\n var test = true; return test; });",
					cleanedCode = amdclean.clean({ code: AMDcode, 'globalObject': true, 'rememberGlobalObject': false, escodegen: { format: { compact: true } } }),
					standardJavaScript = "var amdclean={};amdclean['example']=function (){// Answer\nvar test=true;return test;}();";

				expect(cleanedCode).toBe(standardJavaScript);
			});

			it('should preserve multi-line line comments when converting function return values to immediately invoked function declarations using the globalObject option', function() {
				var AMDcode = "define('example', [], function() {  /* Answer */\nvar test = true; return test; });",
					cleanedCode = amdclean.clean({ code: AMDcode, 'globalObject': true, 'rememberGlobalObject': false, escodegen: { format: { compact: true } } }),
					standardJavaScript = "var amdclean={};amdclean['example']=function (){/* Answer */\nvar test=true;return test;}();";

				expect(cleanedCode).toBe(standardJavaScript);
			});

			it('should passing a file path instead of the code directly', function() {
				var cleanedCode = amdclean.clean({ filePath: __dirname + '/../filePathTest.js', escodegen: { format: { compact: true } } }),
					standardJavaScript = "var example=undefined;";

				expect(cleanedCode).toBe(standardJavaScript);
			});

			it('should correctly set callback parameters to the callback function', function() {
				var AMDcode = "define('example', ['example1', 'example2'], function(one, two) {var test = true;});",
					cleanedCode = amdclean.clean({ code: AMDcode, escodegen: { format: { compact: true } } }),
					standardJavaScript = "var example=function (one,two){var test=true;}(example1,example2);";

				expect(cleanedCode).toBe(standardJavaScript);
			});

			it('should correctly normalize relative file paths', function() {
				var AMDcode = "define('./modules/example', ['example1', 'example2'], function(one, two) {var test = true;});",
					cleanedCode = amdclean.clean({ code: AMDcode, escodegen: { format: { compact: true } } }),
					standardJavaScript = "var modules_example=function (one,two){var test=true;}(example1,example2);";

				expect(cleanedCode).toBe(standardJavaScript);
			});

			it('should correctly normalize relative file paths dependencies', function() {
				var AMDcode = "define('./modules/example', ['./example1', './example2', '../example3'], function(one, two, three) {var test = true;});",
					cleanedCode = amdclean.clean({ code: AMDcode, escodegen: { format: { compact: true } } }),
					standardJavaScript = "var modules_example=function (one,two,three){var test=true;}(modules_example1,modules_example2,example3);";

				expect(cleanedCode).toBe(standardJavaScript);
			});

			it('should correctly normalize relative file paths dependencies with the globalObject option', function() {
				var AMDcode = "define('./modules/example', ['./example1', './example2', '../example3'], function(one, two, three) {var test = true;});",
					cleanedCode = amdclean.clean({ globalObject: true, rememberGlobalObject: false, code: AMDcode, escodegen: { format: { compact: true } } }),
					standardJavaScript = "var amdclean={};amdclean['modules_example']=function (one,two,three){var test=true;}(amdclean['modules_example1'],amdclean['modules_example2'],amdclean['example3']);";

				expect(cleanedCode).toBe(standardJavaScript);
			});

			it('should correctly normalize multi-level relative file paths dependencies', function() {
				var AMDcode = "define('./foo/prototype/subModule/myModule', ['example1','example2', '/anotherModule/example3', '../../example4','../anotherModule/example5'], function(one, two, three, four, five) { var test = true;});",
					cleanedCode = amdclean.clean({ code: AMDcode, escodegen: { format: { compact: true } } }),
					standardJavaScript = "var foo_prototype_subModule_myModule=function (one,two,three,four,five){var test=true;}(example1,example2,anotherModule_example3,foo_example4,foo_prototype_anotherModule_example5);";

				expect(cleanedCode).toBe(standardJavaScript);
			});

			it('should correctly normalize multi-level relative file paths', function() {
				var AMDcode = "define('./foo/prototype/commonMethodName.js', ['example1', 'example2'], function(one, two) { var test = true;});",
					cleanedCode = amdclean.clean({ code: AMDcode, escodegen: { format: { compact: true } } }),
					standardJavaScript = "var foo_prototype_commonMethodNamejs=function (one,two){var test=true;}(example1,example2);";

				expect(cleanedCode).toBe(standardJavaScript);
			});

			it('should correctly prefix reserved keywords with an underscore', function() {
				var AMDcode = "define('foo', ['./function'], function(fn){ fn.bar(); });",
					cleanedCode = amdclean.clean({ code: AMDcode, escodegen: { format: { compact: true } } }),
					standardJavaScript = "var foo=function (fn){fn.bar();}(_function);";

				expect(cleanedCode).toBe(standardJavaScript);
			});

			it('should allow underscores and dollar signs as module names', function() {
				var AMDcode = "define('fo.o', ['./function'], function(fn){ fn.bar(); });",
					cleanedCode = amdclean.clean({ code: AMDcode, escodegen: { format: { compact: true } } }),
					standardJavaScript = "var foo=function (fn){fn.bar();}(_function);";

				expect(cleanedCode).toBe(standardJavaScript);
			});

			it('should not convert defines with an /*amdclean*/ comment before it', function() {
				var AMDcode = "/*amdclean*/define('./modules/example', ['example1', 'example2'], function(one, two) {});",
					cleanedCode = amdclean.clean({ code: AMDcode, escodegen: { comment: false, format: { compact: true } } }),
					standardJavaScript = "define('./modules/example',['example1','example2'],function(one,two){});";

				expect(cleanedCode).toBe(standardJavaScript);
			});

			it('should not convert defines with a custom commentCleanName comment before it', function() {
				var AMDcode = "/*donotremove*/define('./modules/example', ['example1', 'example2'], function(one, two) {});",
					cleanedCode = amdclean.clean({ code: AMDcode, commentCleanName: 'donotremove', escodegen: { comment: false, format: { compact: true } } }),
					standardJavaScript = "define('./modules/example',['example1','example2'],function(one,two){});";

				expect(cleanedCode).toBe(standardJavaScript);
			});

			it('should not convert defines that are added to the ignoreModules options array', function() {
				var AMDcode = "define('exampleModule', ['example1', 'example2'], function(one, two) {});",
					cleanedCode = amdclean.clean({ code: AMDcode, ignoreModules: ['exampleModule'], escodegen: { format: { compact: true } } }),
					standardJavaScript = "define('exampleModule',['example1','example2'],function(one,two){});";

				expect(cleanedCode).toBe(standardJavaScript);
			});

			it('should remove defines that are added to the removeModules options array', function() {
				var AMDcode = "define('exampleModule', ['example1', 'example2'], function(one, two) {});define('exampleModule2', function() {})",
					cleanedCode = amdclean.clean({ code: AMDcode, removeModules: ['exampleModule'], escodegen: { format: { compact: true } } }),
					standardJavaScript = "var exampleModule2=undefined;";

				expect(cleanedCode).toBe(standardJavaScript);
			});

			it('should support the simplified CJS wrapper', function() {
				var AMDcode = "define('foo', ['require', 'exports', './bar'], function(require, exports, bar){exports.bar = require('./bar');});",
					cleanedCode = amdclean.clean({ code: AMDcode, escodegen: { format: { compact: true } } }),
					standardJavaScript = "var foo=function (exports,bar){exports.bar=bar;return exports;}({},bar);";

				expect(cleanedCode).toBe(standardJavaScript);
			});

			it('should support the plain simplified CJS wrapper', function() {
				var AMDcode = "define('foo',['require','exports','module','bar'],function(require, exports){exports.bar = require('bar');});",
					cleanedCode = amdclean.clean({ code: AMDcode, escodegen: { format: { compact: true } } }),
					standardJavaScript = "var foo=function (exports){exports.bar=bar;return exports;}({},bar);";

				expect(cleanedCode).toBe(standardJavaScript);
			});

			it('should support global modules', function() {
				var AMDcode = "define('foo', ['require', 'exports', './bar'], function(require, exports){exports.bar = require('./bar');});",
					cleanedCode = amdclean.clean({ globalModules: ['foo'], code: AMDcode, escodegen: { format: { compact: true } } }),
					standardJavaScript = "var foo=function (exports){exports.bar=bar;return exports;}({},bar);window.foo=foo;";

				expect(cleanedCode).toBe(standardJavaScript);
			});

			it('should support storing modules inside of a global object', function() {
				var AMDcode = "define('foo', ['require', 'exports', './bar'], function(require, exports){exports.bar = require('./bar');});",
					cleanedCode = amdclean.clean({ globalObject: true, rememberGlobalObject: false, globalObjectName: 'yeabuddy', code: AMDcode, escodegen: { format: { compact: true } } }),
					standardJavaScript = "var yeabuddy={};yeabuddy['foo']=function (exports){exports.bar=yeabuddy['bar'];return exports;}({},yeabuddy['bar']);";

				expect(cleanedCode).toBe(standardJavaScript);
			});

			it('should support converting shimmed modules that export a global object', function() {
				var AMDcode = "define('backbone', ['underscore', 'jquery'], (function (global) { return function () { var ret, fn; return ret || global.Backbone; }; }(this)));",
					cleanedCode = amdclean.clean({ code: AMDcode, escodegen: { format: { compact: true } } }),
					standardJavaScript = "var backbone=window.Backbone;";

				expect(cleanedCode).toBe(standardJavaScript);
			});

			it('should support setting the module return value via the shimOverrides option', function() {
				var AMDcode = "define('backbone', ['underscore', 'jquery'], (function (global) { return function () { var ret, fn; return ret || global.Backbone; }; }(this)));",
					cleanedCode = amdclean.clean({ shimOverrides: { 'backbone': 'window.Backbone' }, code: AMDcode, escodegen: { format: { compact: true } } }),
					standardJavaScript = "var backbone=window.Backbone;";

				expect(cleanedCode).toBe(standardJavaScript);
			});

			it('should support converting define() methods with identifiers', function() {
				var AMDcode = "define('esprima', ['exports'], factory);",
					cleanedCode = amdclean.clean({ code: AMDcode, escodegen: { format: { compact: true } } }),
					standardJavaScript = "var esprima=function (){return factory();}({});";

				expect(cleanedCode).toBe(standardJavaScript);
			});

			it('should correctly convert amd check if statements to if(true){}', function() {
				var AMDcode = "if(typeof define == 'function') { var test = true; }",
					cleanedCode = amdclean.clean({ code: AMDcode, escodegen: { format: { compact: true } } }),
					standardJavaScript = "if(true){var test=true;}";

				expect(cleanedCode).toBe(standardJavaScript);
			});

			it('should not remove comments from the source code', function() {
				var AMDcode = "//Test comment\n define('example', [], function() {});",
					cleanedCode = amdclean.clean({ code: AMDcode, escodegen: { format: { compact: true } } }),
					standardJavaScript = "//Test comment\nvar example=undefined;";

				expect(cleanedCode).toBe(standardJavaScript);
			});

			it('should not automatically convert conditional AMD checks that are using the appropriate commentCleanName', function() {
				var AMDcode = "//amdclean\n if(typeof define === 'function') {}",
					cleanedCode = amdclean.clean({ code: AMDcode, escodegen: { format: { compact: true } } }),
					standardJavaScript = "//amdclean\nif(typeof define==='function'){}";

				expect(cleanedCode).toBe(standardJavaScript);
			});

			it('should not automatically convert conditional AMD checks if the transformAMDChecks option is set to false', function() {
				var AMDcode = "if(typeof define === 'function') {}",
					cleanedCode = amdclean.clean({ code: AMDcode, transformAMDChecks: false, escodegen: { format: { compact: true } } }),
					standardJavaScript = "if(typeof define==='function'){}";

				expect(cleanedCode).toBe(standardJavaScript);
			});

			describe('optimized defines', function() {

				it('should optimize basic define() methods that return a function expression', function() {
					var AMDcode = "define('optimized', function () { return function ( thing ) {return !isNaN( parseFloat( thing ) ) && isFinite( thing );};});",
						cleanedCode = amdclean.clean({ code: AMDcode, escodegen: { format: { compact: true } } }),
						standardJavaScript = "var optimized=function(thing){return!isNaN(parseFloat(thing))&&isFinite(thing);};";

					expect(cleanedCode).toBe(standardJavaScript);
				});

				it('should optimize basic define() methods that have an empty factory function', function() {
					var AMDcode = "define('optimized', function () {});",
						cleanedCode = amdclean.clean({ code: AMDcode, escodegen: { format: { compact: true } } }),
						standardJavaScript = "var optimized=undefined;";

					expect(cleanedCode).toBe(standardJavaScript);
				});

				it('should support the start and end wrap options', function() {
					var AMDcode = "define('optimized', function () {});",
						cleanedCode = amdclean.clean({ code: AMDcode, wrap: { 'start': '(function() {', 'end': '}());' }, escodegen: { format: { compact: true } } }),
						standardJavaScript = "(function() {var optimized=undefined;}());";

					expect(cleanedCode).toBe(standardJavaScript);
				});

				it('should optimize more complex define() methods that return a function expression', function() {
					var AMDcode = "define('optimized', function () { return function ( thing ) { var anotherThing = true; return !isNaN( parseFloat( thing ) ) && isFinite( thing );};});",
						cleanedCode = amdclean.clean({ code: AMDcode, escodegen: { format: { compact: true } } }),
						standardJavaScript = "var optimized=function(thing){var anotherThing=true;return!isNaN(parseFloat(thing))&&isFinite(thing);};";

					expect(cleanedCode).toBe(standardJavaScript);
				});

				it('should optimize more complex define() methods that have a "use strict" statement and return a function expression', function() {
					var AMDcode = "define('optimized', function () { 'use strict'; return function ( thing ) { return !isNaN( parseFloat( thing ) ) && isFinite( thing );};});",
						cleanedCode = amdclean.clean({ code: AMDcode, escodegen: { format: { compact: true } } }),
						standardJavaScript = "var optimized=function(thing){return!isNaN(parseFloat(thing))&&isFinite(thing);};";

					expect(cleanedCode).toBe(standardJavaScript);
				});

				it('should not optimize more complex define() methods that have a "use strict" statement and return a function expression, but have also set the removeUseStricts option to false', function() {
					var AMDcode = "define('optimized', function () { 'use strict'; return function ( thing ) { return !isNaN( parseFloat( thing ) ) && isFinite( thing );};});",
						cleanedCode = amdclean.clean({ removeUseStricts: false, code: AMDcode, escodegen: { format: { compact: true } } }),
						standardJavaScript = "var optimized=function (){'use strict';return function(thing){return!isNaN(parseFloat(thing))&&isFinite(thing);};}();";

					expect(cleanedCode).toBe(standardJavaScript);
				});

				it('should not optimize define() methods that have logic outside of the return statement', function() {
					var AMDcode = "define('optimized', [], function () { var test = true; return function ( thing ) { var anotherThing = true; return !isNaN( parseFloat( thing ) ) && isFinite( thing );};});",
						cleanedCode = amdclean.clean({ code: AMDcode, escodegen: { format: { compact: true } } }),
						standardJavaScript = "var optimized=function (){var test=true;return function(thing){var anotherThing=true;return!isNaN(parseFloat(thing))&&isFinite(thing);};}();";

					expect(cleanedCode).toBe(standardJavaScript);
				});

				it('should not optimize define() methods that have one or more dependencies', function() {
					var AMDcode = "define('optimized', ['exampleDependency'], function () { return function ( thing ) { var anotherThing = true; return !isNaN( parseFloat( thing ) ) && isFinite( thing );};});",
						cleanedCode = amdclean.clean({ code: AMDcode, escodegen: { format: { compact: true } } }),
						standardJavaScript = "var optimized=function (){return function(thing){var anotherThing=true;return!isNaN(parseFloat(thing))&&isFinite(thing);};}(exampleDependency);";

					expect(cleanedCode).toBe(standardJavaScript);
				});

				it('should optimize basic define() methods that return a literal value', function() {
					var AMDcode = "define('optimized', [], function() { return 'Convert AMD code to standard JavaScript';});",
						cleanedCode = amdclean.clean({ code: AMDcode, escodegen: { format: { compact: true } } }),
						standardJavaScript = "var optimized='Convert AMD code to standard JavaScript';";

					expect(cleanedCode).toBe(standardJavaScript);
				});

				it('should not optimize basic define() methods that return a literal value and contain more than one code block', function() {
					var AMDcode = "define('optimized', [], function() { var example = true; return 'Convert AMD code to standard JavaScript';});",
						cleanedCode = amdclean.clean({ code: AMDcode, escodegen: { format: { compact: true } } }),
						standardJavaScript = "var optimized=function (){var example=true;return'Convert AMD code to standard JavaScript';}();";

					expect(cleanedCode).toBe(standardJavaScript);
				});

				it('should not optimize basic define() methods that return a literal value that have one or more dependencies', function() {
					var AMDcode = "define('optimized', ['someDependency'], function() { return 'Convert AMD code to standard JavaScript';});",
						cleanedCode = amdclean.clean({ code: AMDcode, escodegen: { format: { compact: true } } }),
						standardJavaScript = "var optimized=function (){return'Convert AMD code to standard JavaScript';}(someDependency);";

					expect(cleanedCode).toBe(standardJavaScript);
				});

				it('should optimize basic define() methods that return a nested object expression', function() {
					var AMDcode = "define('optimized', [], function() {return { 'example': 'Convert AMD code to standard JavaScript' };});",
						cleanedCode = amdclean.clean({ code: AMDcode, escodegen: { format: { compact: true } } }),
						standardJavaScript = "var optimized={'example':'Convert AMD code to standard JavaScript'};";

					expect(cleanedCode).toBe(standardJavaScript);
				});

				it('should optimize basic define() methods that return a new expression', function() {
					var AMDcode = "define('optimized', [], function() { return new String('test');});",
						cleanedCode = amdclean.clean({ code: AMDcode, escodegen: { format: { compact: true } } }),
						standardJavaScript = "var optimized=new String('test');";

					expect(cleanedCode).toBe(standardJavaScript);
				});

				it('should not optimize basic define() methods that return an identifier', function() {
					var AMDcode = "define('jquery', [], function() {return jQuery;});",
						cleanedCode = amdclean.clean({ code: AMDcode, escodegen: { format: { compact: true } } }),
						standardJavaScript = "var jquery=function (){return jQuery;}();";

					expect(cleanedCode).toBe(standardJavaScript);
				});

				it('should convert CommonJS require() calls and use the character prefix', function() {
					var AMDcode = "var example = require('bb_customs');",
						cleanedCode = amdclean.clean({ prefixMode: 'camelCase', code: AMDcode, escodegen: { format: { compact: true } } }),
						standardJavaScript = "var example=bbCustoms;";

					expect(cleanedCode).toBe(standardJavaScript);
				});

				it('should convert CommonJS require() calls and use the character prefix', function() {
					var AMDcode = "var example = require('util/anotherModule');",
						cleanedCode = amdclean.clean({ prefixMode: 'camelCase', code: AMDcode, escodegen: { format: { compact: true } } }),
						standardJavaScript = "var example=utilAnotherModule;";

					expect(cleanedCode).toBe(standardJavaScript);
				});

				it('should correctly transform each module name when using the prefixTransform option', function() {
					var AMDcode = "var example = require('util/anotherModule');",
						cleanedCode = amdclean.clean({
							code: AMDcode,
							escodegen: {
								format: {
									compact: true
								}
							},
							prefixTransform: function(moduleName, moduleId) {
								return moduleName.substring(moduleName.lastIndexOf('_') + 1, moduleName.length);
							}
						}),
						standardJavaScript = "var example=anotherModule;";

					expect(cleanedCode).toBe(standardJavaScript);
				});

			});

		});

		describe('objects', function() {

			it('should convert object return values to variable declarations', function() {
				var AMDcode = "define('third', { exampleProp: 'This is an example' });",
					cleanedCode = amdclean.clean({ code: AMDcode, escodegen: { format: { compact: true } } }),
					standardJavaScript = "var third={exampleProp:'This is an example'};";

				expect(cleanedCode).toBe(standardJavaScript);
			});

			it('should convert object return values to a global object', function() {
				var AMDcode = "define('third', { exampleProp: 'This is an example' });",
					cleanedCode = amdclean.clean({ globalObject: true, rememberGlobalObject: false, code: AMDcode, escodegen: { format: { compact: true } } }),
					standardJavaScript = "var amdclean={};amdclean['third']={exampleProp:'This is an example'};";

				expect(cleanedCode).toBe(standardJavaScript);
			});

		});

		describe('CommonJS Variable Declarations', function() {

			it('should convert CommonJS require() calls', function() {
				var AMDcode = "var example = require('anotherModule');",
					cleanedCode = amdclean.clean({ code: AMDcode, escodegen: { format: { compact: true } } }),
					standardJavaScript = "var example=anotherModule;";

				expect(cleanedCode).toBe(standardJavaScript);
			});

			it('should convert CommonJS require() calls correctly with the globalObject option', function() {
				var AMDcode = "var example = require('anotherModule');",
					cleanedCode = amdclean.clean({ code: AMDcode, globalObject: true, rememberGlobalObject: false, escodegen: { format: { compact: true } } }),
					standardJavaScript = "var amdclean={};var example=amdclean['anotherModule'];";

				expect(cleanedCode).toBe(standardJavaScript);
			});

			it('should convert CommonJS require() calls with file paths', function() {
				var AMDcode = "var example = require('./anotherModule');",
					cleanedCode = amdclean.clean({ code: AMDcode, escodegen: { format: { compact: true } } }),
					standardJavaScript = "var example=anotherModule;";

				expect(cleanedCode).toBe(standardJavaScript);
			});

			it('should convert CommonJS require() calls with advanced file paths', function() {
				var AMDcode = "var example = require('./../anotherModule');",
					cleanedCode = amdclean.clean({ code: AMDcode, escodegen: { format: { compact: true } } }),
					standardJavaScript = "var example=anotherModule;";

				expect(cleanedCode).toBe(standardJavaScript);
			});

			it('should convert CommonJS require() calls with single properties', function() {
				var AMDcode = "var example = require('./anotherModule').prop;",
					cleanedCode = amdclean.clean({ code: AMDcode, escodegen: { format: { compact: true } } }),
					standardJavaScript = "var example=anotherModule.prop;";

				expect(cleanedCode).toBe(standardJavaScript);
			});

			it('should convert CommonJS require() calls with method calls', function() {
				var AMDcode = "var example = require('./anotherModule').prop();",
					cleanedCode = amdclean.clean({ code: AMDcode, escodegen: { format: { compact: true } } }),
					standardJavaScript = "var example=anotherModule.prop();";

				expect(cleanedCode).toBe(standardJavaScript);
			});

		});

	});

	describe('require() method conversions', function() {

		describe('functions', function() {

			it('should convert function return values to locally scoped IIFEs', function() {
				var AMDcode = "require([], function() { var example = true; });",
					cleanedCode = amdclean.clean({ code: AMDcode, escodegen: { format: { compact: true } } }),
					standardJavaScript = "(function(){var example=true;}());";

				expect(cleanedCode).toBe(standardJavaScript);
			});

			it('should preserve single line comments when converting require methods', function() {
				var AMDcode = "require([], function() { // test comment\n var example = true; });",
					cleanedCode = amdclean.clean({ code: AMDcode, escodegen: { format: { compact: true } } }),
					standardJavaScript = "(function(){// test comment\nvar example=true;}());";

				expect(cleanedCode).toBe(standardJavaScript);
			});

			it('should pass the correct parameters to the locally scoped IIFEs', function() {
				var AMDcode = "require(['anotherModule'], function(anotherModule) { var example = true; });",
					cleanedCode = amdclean.clean({ code: AMDcode, escodegen: { format: { compact: true } } }),
					standardJavaScript = "(function(anotherModule){var example=true;}(anotherModule));";

				expect(cleanedCode).toBe(standardJavaScript);
			});

			it('should correctly normalize relative file paths', function() {
				var AMDcode = "require(['./modules/anotherModule'], function(anotherModule) { var example = true; });",
					cleanedCode = amdclean.clean({ code: AMDcode, escodegen: { format: { compact: true } } }),
					standardJavaScript = "(function(anotherModule){var example=true;}(modules_anotherModule));";

				expect(cleanedCode).toBe(standardJavaScript);
			});

			it('should not convert requires with an /*amdclean*/ comment before it', function() {
				var AMDcode = "/*amdclean*/require(['./modules/anotherModule'], function(anotherModule) { var example = true; });",
					cleanedCode = amdclean.clean({ code: AMDcode, escodegen: { comment: false, format: { compact: true } } }),
					standardJavaScript = "require(['./modules/anotherModule'],function(anotherModule){var example=true;});";

				expect(cleanedCode).toBe(standardJavaScript);
			});

			it('should remove require() calls with no callback functions', function() {
				var AMDcode = "require(['anotherModule']);",
					cleanedCode = amdclean.clean({ code: AMDcode, escodegen: { format: { compact: true } } }),
					standardJavaScript = "";

				expect(cleanedCode).toBe(standardJavaScript);
			});

			it('should remove require() calls with an empty callback function', function() {
				var AMDcode = "require(['testModule'], function() {});",
					cleanedCode = amdclean.clean({ code: AMDcode, escodegen: { format: { compact: true } } }),
					standardJavaScript = "";

				expect(cleanedCode).toBe(standardJavaScript);
			});

			it('should not remove require() calls with a non-empty callback function', function() {
				var AMDcode = "require(['testModule'], function() {var test=true;});",
					cleanedCode = amdclean.clean({ code: AMDcode, escodegen: { format: { compact: true } } }),
					standardJavaScript = "(function(){var test=true;}(testModule));";

				expect(cleanedCode).toBe(standardJavaScript);
			});

			it('should remove all require() calls when the removeAllRequires option is set to true', function() {
				var AMDcode = "require(['testModule'], function() {var test=true;});",
					cleanedCode = amdclean.clean({ code: AMDcode, removeAllRequires: true, escodegen: { format: { compact: true } } }),
					standardJavaScript = "";

				expect(cleanedCode).toBe(standardJavaScript);
			});

			it('should not bomb on extra parameters being passed to the require() method', function() {
				var AMDcode = "require(['blah'], function(blahParam) { var two = 1 + 1; }, undefined, true);",
					cleanedCode = amdclean.clean({ code: AMDcode, escodegen: { format: { compact: true } } }),
					standardJavaScript = "(function(blahParam){var two=1+1;}(blah));";

				expect(cleanedCode).toBe(standardJavaScript);
			});

			it('should correctly convert libraries with simple conditional AMD checks', function() {
				var AMDcode = "(function (root, factory) {" +
					"'use strict';" +
					"if (typeof define === 'function') {" +
					"define('esprima', ['exports'], factory);" +
					"} else if (typeof exports !== 'undefined') {" +
					"factory(exports);" +
					"} else {" +
					"factory((root.esprima = {}));" +
					"}" +
					"}(this, function (exports) {" +
					"var test = true;" +
					"}));",
					cleanedCode = amdclean.clean({ code: AMDcode, escodegen: { format: { compact: true } } }),
					standardJavaScript = "(function(root,factory){'use strict';if(true){var esprima=function (){return factory();}({});}else if(typeof exports!=='undefined'){factory(exports);}else{factory(root.esprima={});}}(this,function(exports){exports=exports||{};var test=true;return exports;}));";

				expect(cleanedCode).toBe(standardJavaScript);
			});

			it('should correctly convert libraries that use factory function parameters', function() {
				var AMDcode = "(function (factory) {" +
					"if (typeof exports === 'object') {" +
					"module.exports = factory(require('backbone'), require('underscore'));" +
					"} else if (typeof define === 'function' && define.amd) {" +
					"define('backbonevalidation', ['backbone', 'underscore'], factory);" +
					"}" +
					"}(function (Backbone, _) {" +
					"//= backbone-validation.js\n" +
					"return Backbone.Validation;" +
					"}));",
					cleanedCode = amdclean.clean({ code: AMDcode, escodegen: { format: { compact: true } } }),
					standardJavaScript = "(function(factory){if(typeof exports==='object'){module.exports=factory(backbone,underscore);}else if(true){var backbonevalidation=function (backbone,underscore){return factory(backbone,underscore);}(backbone,underscore);}}(function(Backbone,_){//= backbone-validation.js\nreturn Backbone.Validation;}));";

				expect(cleanedCode).toBe(standardJavaScript);
			});

		});

	});

});