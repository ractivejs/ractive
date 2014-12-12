"use strict";
var grunt = require("grunt"),
    exec = require("child_process").exec;

(function() {

    function beautifyAndassert(test, task, actualFile, expectedFile) {
        exec("grunt " + task, function(error, stdout, stderr) {
            var actual = grunt.file.read("tmp/fileMapping/" + actualFile),
                expected = grunt.file.read("tmp/fileMapping/" + expectedFile);
            test.equal(actual, expected, "should beautify js " + actualFile + " using config file");
            test.done();
        });
    }

    exports["fileMapping_test"] = {
        "beautification of js file using file mapping": function(test) {
            test.expect(1);
            beautifyAndassert(test, "jsbeautifier:fileMapping", "not-beautified.js.erb", "expected/beautified.js.erb");
        },
        "beautification of css file using file mapping": function(test) {
            test.expect(1);
            beautifyAndassert(test, "jsbeautifier:fileMapping", "not-beautified.css.erb", "expected/beautified.css.erb");
        },
        "beautification of html file using file mapping": function(test) {
            test.expect(1);
            beautifyAndassert(test, "jsbeautifier:fileMapping", "not-beautified.html.erb", "expected/beautified.html.erb");
        }
    };
})();
