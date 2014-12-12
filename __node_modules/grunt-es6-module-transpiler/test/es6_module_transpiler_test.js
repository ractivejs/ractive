'use strict';

var grunt = require('grunt');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

function normalizedFileRead(path) {
  return grunt.util.normalizelf(grunt.file.read(path));
}

exports.es6_module_transpiler = {
  setUp: function(done) {
    done();
  },
  toCJS: function(test) {
    test.expect(1);

    var actual = normalizedFileRead('tmp/cjs.js');
    var expected = normalizedFileRead('test/expected/cjs.js');
    test.equal(actual, expected, 'outputs CommonJS');

    test.done();
  },
  toAMD: function(test) {
    test.expect(1);

    var actual = normalizedFileRead('tmp/amd.js');
    var expected = normalizedFileRead('test/expected/amd.js');
    test.equal(actual, expected, 'outputs AMD');

    test.done();
  },
  toYUI: function(test) {
    test.expect(1);

    var actual = normalizedFileRead('tmp/yui.js');
    var expected = normalizedFileRead('test/expected/yui.js');
    test.equal(actual, expected, 'outputs YUI');

    test.done();
  },
  toGlobals: function(test) {
    test.expect(1);

    var actual = normalizedFileRead('tmp/globals.js');
    var expected = normalizedFileRead('test/expected/globals.js');
    test.equal(actual, expected, 'outputs Globals');

    test.done();
  },
  moduleNameOption: function(test) {
    test.expect(1);

    var actual = normalizedFileRead('tmp/name.js');
    var expected = normalizedFileRead('test/expected/name.js');
    test.equal(actual, expected, 'understands moduleName option');

    test.done();
  },
  moduleNameCallbackOption: function(test) {
    test.expect(1);

    var actual = normalizedFileRead('tmp/name_callback.js');
    var expected = normalizedFileRead('test/expected/name_callback.js');
    test.equal(actual, expected, 'understands moduleName option with function');

    test.done();
  },
  moduleNameCallbackOptionWithCwd: function(test) {
    test.expect(1);

    var actual = normalizedFileRead('tmp/name_callback_with_cwd.js');
    var expected = normalizedFileRead('test/expected/name_callback_with_cwd.js');
    test.equal(actual, expected, 'understands moduleName option with function with cwd');

    test.done();
  },
  anonymousOption: function(test) {
    test.expect(1);

    var actual = normalizedFileRead('tmp/anonymous.js');
    var expected = normalizedFileRead('test/expected/anonymous.js');
    test.equal(actual, expected, 'understands anonymous option');

    test.done();
  },
  coffeeSrc: function(test) {
    test.expect(1);

    var actual = normalizedFileRead('tmp/coffee.coffee');
    var expected = normalizedFileRead('test/expected/coffee.coffee');
    test.equal(actual.trim(), expected.trim(), 'understands coffee option');

    test.done();
  },
  mixedCoffeeAndJS: function(test) {
    test.expect(1);

    // in the config there is a .coffee file listed before this one
    var actual = normalizedFileRead('tmp/anonymous.js');
    var expected = normalizedFileRead('test/expected/anonymous.js');
    test.equal(actual, expected, 'uses coffee option only on CoffeeScript files');

    test.done();
  }
};
